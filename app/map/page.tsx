"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import L from "leaflet";
import Link from "next/link";

// Leaflet を SSR 無効で読み込む
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

// useMap はコンポーネント内で dynamic import する
let UseMapComponent: any = null;

/* ============================================
   ★ 点滅マーカー（ANZEN版）
============================================ */
const blinkingIcon = L.divIcon({
  className: "",
  html: `<div class="blink-sos"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

/* ============================================
   ★ 距離計算（メートル）
============================================ */
const calcDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371e3;
  const toRad = (x: number) => (x * Math.PI) / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lng2 - lng1);

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/* ============================================
   ★ 現在地ボタン（ANZEN UI）
============================================ */
function RecenterButton({
  position,
  onRecenter,
}: {
  position: [number, number] | null;
  onRecenter: () => void;
}) {
  if (!UseMapComponent) return null;
  const map = UseMapComponent();

  return (
    <button
      onClick={() => {
        if (position) {
          map.setView(position, 16);
          onRecenter();
        }
      }}
      className="locate-button"
      style={{
        position: "absolute",
        bottom: 120,
        right: 16,
        zIndex: 9999,
        padding: "10px 14px",
        background: "white",
        color: "#111",
        borderRadius: 10,
        border: "1px solid #ddd",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        fontWeight: "bold",
      }}
    >
      現在地
    </button>
  );
}

export default function MapPage() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [follow, setFollow] = useState(true);
  const mapRef = useRef<any>(null);

  const [recording, setRecording] = useState(false);
  const recordInterval = useRef<NodeJS.Timer | null>(null);

  // ★ 災害SOS一覧（プロフィール JOIN）
  const [disasterSOS, setDisasterSOS] = useState<any[]>([]);

  // ★ 家族一覧（user_id の配列）
  const [familyList, setFamilyList] = useState<string[]>([]);

  // ★ プロフィール未設定バナー
  const [showProfileBanner, setShowProfileBanner] = useState(false);

  // useMap を CSR 時にだけ読み込む
  useEffect(() => {
    (async () => {
      const mod = await import("react-leaflet");
      UseMapComponent = mod.useMap;
    })();
  }, []);

  /* ============================================
     ★ プロフィール未設定チェック
  ============================================ */
  useEffect(() => {
    const checkProfile = async () => {
      if (typeof window === "undefined") return;

      if (localStorage.getItem("profile_prompt_shown")) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const noName = !profile.name || profile.name.trim() === "";
      const noAvatar = !profile.avatar_url || profile.avatar_url.trim() === "";

      if (noName || noAvatar) {
        setShowProfileBanner(true);
        localStorage.setItem("profile_prompt_shown", "1");
      }
    };

    checkProfile();
  }, []);

  /* ============================================
     ★ 現在地取得
  ============================================ */
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(newPos);

        if (follow && mapRef.current) {
          mapRef.current.setView(newPos, 16);
        }
      },
      (err) => console.error("位置情報エラー:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [follow]);

  const handleMapMove = () => {
    if (follow) setFollow(false);
  };

  /* ============================================
     ★ 家族一覧を取得（approved のみ）
  ============================================ */
  useEffect(() => {
    const fetchFamily = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("family_links")
        .select("family_user_id")
        .eq("user_id", user.id)
        .eq("status", "approved");

      if (data) {
        setFamilyList(data.map((f) => f.family_user_id));
      }
    };

    fetchFamily();
  }, []);

  /* ============================================
     ★ 初回ロード時に災害SOS + profiles を取得
  ============================================ */
  useEffect(() => {
    const fetchSOS = async () => {
      const { data } = await supabase
        .from("disaster_sos")
        .select(
          `
          *,
          profiles!disaster_sos_user_id_fkey (
            name,
            avatar_url,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (data) {
        setDisasterSOS(data);
      }
    };

    fetchSOS();
  }, []);

  /* ============================================
     ★ リアルタイム購読（INSERT）
  ============================================ */
  useEffect(() => {
    const channel = supabase
      .channel("realtime-disaster-sos")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "disaster_sos" },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url, email")
            .eq("id", payload.new.user_id)
            .single();

          setDisasterSOS((prev) => [
            { ...payload.new, profiles: profile },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ============================================
     ★ visibility フィルタリング（家族対応）
  ============================================ */
  const filterSOS = (sos: any) => {
    if (!position) return false;

    const { visibility, lat, lng, user_id } = sos;

    const isFamily = familyList.includes(user_id);

    const distance = Math.sqrt(
      Math.pow(lat - position[0], 2) + Math.pow(lng - position[1], 2)
    );
    const isNearby = distance < 0.02;

    switch (visibility) {
      case "all":
        return true;
      case "nearby":
        return isNearby;
      case "family_nearby":
        return isFamily || isNearby;
      case "family_only":
        return isFamily;
      default:
        return false;
    }
  };

  /* ============================================
     ★ 記録開始 / 終了
  ============================================ */
  const startRecording = async () => {
    if (!position) return;

    const { data, error } = await supabase
      .from("routes")
      .insert({
        user_id: "test-user",
        title: new Date().toLocaleString(),
      })
      .select()
      .single();

    if (error) return console.error(error);

    setRecording(true);

    recordInterval.current = setInterval(async () => {
      await supabase.from("route_points").insert({
        route_id: data.id,
        lat: position[0],
        lng: position[1],
      });
    }, 1000);
  };

  const stopRecording = () => {
    setRecording(false);
    if (recordInterval.current) {
      clearInterval(recordInterval.current);
      recordInterval.current = null;
    }
  };

  /* ============================================
     ★ レンダリング
  ============================================ */
  return (
    <div style={{ height: "100dvh", width: "100%", position: "relative" }}>
      {/* ★ プロフィール未設定バナー */}
      {showProfileBanner && (
        <div
          className="notification-banner"
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#2563EB",
            padding: "14px 20px",
            borderRadius: "10px",
            color: "white",
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            textAlign: "center",
            width: "90%",
            maxWidth: "360px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
            プロフィールを設定しましょう
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>
            名前とアイコンを設定すると、SOS時に家族があなたを見つけやすくなります。
          </div>

          <Link
            href="/profile"
            style={{
              display: "block",
              marginTop: "10px",
              padding: "8px",
              background: "white",
              color: "#2563EB",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            プロフィールを設定する
          </Link>
        </div>
      )}

      {position && (
        <MapContainer
          center={position}
          zoom={16}
          whenCreated={(map) => (mapRef.current = map)}
          style={{ height: "100dvh", width: "100%" }}
          onDragstart={handleMapMove}
          onZoomstart={handleMapMove}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 現在地 */}
          <Marker position={position} />

          {/* ★ 災害SOSマーカー（プロフィール対応） */}
          {disasterSOS.filter(filterSOS).map((sos) => {
            const isFamily = familyList.includes(sos.user_id);
            const distance =
              position &&
              calcDistance(position[0], position[1], sos.lat, sos.lng);

            const name =
              sos.profiles?.name ||
              sos.profiles?.email ||
              sos.user_id?.substring(0, 8);

            const avatar =
              sos.profiles?.avatar_url ||
              "https://cdn-icons-png.flaticon.com/512/456/456212.png"; // ★ 柔らかい丸型シルエット

            return (
              <Marker
                key={sos.id}
                position={[sos.lat, sos.lng]}
                icon={blinkingIcon}
              >
                <Popup>
                  <div style={{ fontSize: "14px", lineHeight: "1.4" }}>
                    {/* アイコン */}
                    <img
                      src={avatar}
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        border: isFamily ? "3px solid #2563EB" : "2px solid #ddd",
                        objectFit: "cover",
                        marginBottom: "8px",
                      }}
                    />

                    {/* 名前 */}
                    <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                      {name}
                      {isFamily && (
                        <span
                          style={{
                            marginLeft: "6px",
                            padding: "2px 6px",
                            background: "#2563EB",
                            color: "white",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          家族
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: "6px" }}>
                      <strong>発信時刻:</strong>{" "}
                      {new Date(sos.created_at).toLocaleString()}
                      <br />
                      <strong>公開範囲:</strong> {sos.visibility}
                      <br />
                      {distance && (
                        <>
                          <strong>距離:</strong> {distance}m
                        </>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {UseMapComponent && (
            <RecenterButton
              position={position}
              onRecenter={() => setFollow(true)}
            />
          )}
        </MapContainer>
      )}

      {/* 記録ボタン */}
      {!recording ? (
        <button
          onClick={startRecording}
          style={{
            position: "absolute",
            bottom: 60,
            right: 20,
            zIndex: 1000,
            padding: "12px 18px",
            background: "#28a745",
            color: "white",
            borderRadius: 8,
            border: "none",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          ● 記録開始
        </button>
      ) : (
        <button
          onClick={stopRecording}
          style={{
            position: "absolute",
            bottom: 60,
            right: 20,
            zIndex: 1000,
            padding: "12px 18px",
            background: "#dc3545",
            color: "white",
            borderRadius: 8,
            border: "none",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          ■ 記録終了
        </button>
      )}
    </div>
  );
}
