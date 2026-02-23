"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import L from "leaflet";
import Link from "next/link";

// Leaflet SSR 無効
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

let UseMapComponent: any = null;

/* ============================================
   ★ 高齢者用オレンジ点滅マーカー
============================================ */
const elderlyBlinkIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:28px;
    height:28px;
    background:#F5A623;
    border-radius:50%;
    border:3px solid white;
    animation: elderlyBlink 1.4s infinite;
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/* ============================================
   ★ 距離計算
============================================ */
const calcDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3;
  const toRad = (x) => (x * Math.PI) / 180;

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
function RecenterButton({ position, onRecenter }) {
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
      style={{
        position: "absolute",
        bottom: 120,
        right: 16,
        zIndex: 9999,
        padding: "10px 14px",
        background: "white",
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

export default function ElderlyMap() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [follow, setFollow] = useState(true);
  const mapRef = useRef<any>(null);

  const [elderlySOS, setElderlySOS] = useState<any[]>([]);
  const [elderlySafe, setElderlySafe] = useState<any[]>([]);
  const [fallAlert, setFallAlert] = useState(false);

  const [familyList, setFamilyList] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const mod = await import("react-leaflet");
      UseMapComponent = mod.useMap;
    })();
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
     ★ 家族一覧
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

      if (data) setFamilyList(data.map((f) => f.family_user_id));
    };

    fetchFamily();
  }, []);

  /* ============================================
     ★ 高齢者SOS + プロフィール JOIN
  ============================================ */
  useEffect(() => {
    const fetchSOS = async () => {
      const { data } = await supabase
        .from("elderly_sos")
        .select(
          `
          *,
          profiles!elderly_sos_user_id_fkey (
            name,
            avatar_url,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (data) setElderlySOS(data);
    };

    fetchSOS();
  }, []);

  /* ============================================
     ★ 元気です（安否チェック）
  ============================================ */
  useEffect(() => {
    const fetchSafe = async () => {
      const { data } = await supabase
        .from("elderly_safe")
        .select(
          `
          *,
          profiles!elderly_safe_user_id_fkey (
            name,
            avatar_url
          )
        `
        )
        .order("created_at", { ascending: false });

      if (data) setElderlySafe(data);
    };

    fetchSafe();
  }, []);

  /* ============================================
     ★ 転倒検知（疑似）通知
  ============================================ */
  useEffect(() => {
    const channel = supabase
      .channel("elderly-fall")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "elderly_fall" },
        () => {
          setFallAlert(true);
          setTimeout(() => setFallAlert(false), 4000);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  /* ============================================
     ★ レンダリング
  ============================================ */
  return (
    <div style={{ height: "100dvh", width: "100%", position: "relative" }}>
      {/* ★ 転倒アラート */}
      {fallAlert && (
        <div
          className="notification-banner"
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#E74C3C",
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
          ⚠️ 転倒の可能性があります
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

          {/* 自分の位置 */}
          <Marker position={position} />

          {/* ★ 高齢者SOSマーカー */}
          {elderlySOS.map((sos) => {
            const name =
              sos.profiles?.name ||
              sos.profiles?.email ||
              sos.user_id.substring(0, 8);

            const avatar =
              sos.profiles?.avatar_url ||
              "https://cdn-icons-png.flaticon.com/512/456/456212.png";

            const distance =
              position &&
              calcDistance(position[0], position[1], sos.lat, sos.lng);

            return (
              <Marker
                key={sos.id}
                position={[sos.lat, sos.lng]}
                icon={elderlyBlinkIcon}
              >
                <Popup>
                  <div style={{ fontSize: "15px", lineHeight: "1.5" }}>
                    <img
                      src={avatar}
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        border: "3px solid #F5A623",
                        objectFit: "cover",
                        marginBottom: "8px",
                      }}
                    />

                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                      {name}
                    </div>

                    <div style={{ marginTop: "6px" }}>
                      <strong>発信時刻:</strong>{" "}
                      {new Date(sos.created_at).toLocaleString()}
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

          {/* ★ 元気です（安否チェック） */}
          {elderlySafe.length > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                background: "white",
                padding: "10px 16px",
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                fontWeight: "bold",
                color: "#27AE60",
                zIndex: 9999,
              }}
            >
              🟢 元気です（{new Date(
                elderlySafe[0].created_at
              ).toLocaleTimeString()}）
            </div>
          )}

          {UseMapComponent && (
            <RecenterButton
              position={position}
              onRecenter={() => setFollow(true)}
            />
          )}
        </MapContainer>
      )}
    </div>
  );
}
