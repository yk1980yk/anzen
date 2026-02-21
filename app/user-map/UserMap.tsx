"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

import Compass from "./components/Compass";
import DirectionArrow from "./components/DirectionArrow";
import DistanceDisplay from "./components/DistanceDisplay";
import { getDistance } from "./components/getDistance";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function UserMap({ mode }) {
  const router = useRouter();

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // ★ Supabase から取得する目的地
  const [target, setTarget] = useState<{ lat: number; lng: number } | null>(null);

  // ★ プロフィール取得（ミニアプリON/OFF & 課金状態）
  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    };

    fetchProfile();
  }, []);

  // ★ コンパス取得
  useEffect(() => {
    const handleOrientation = (event: any) => {
      let h;
      if (event.webkitCompassHeading) {
        h = event.webkitCompassHeading; // iPhone
      } else {
        h = 360 - event.alpha; // Android
      }
      setHeading(h);
    };

    window.addEventListener("deviceorientation", handleOrientation, true);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  // ★ 現在地取得
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  // ★ Supabase から目的地を取得
  useEffect(() => {
    const fetchTarget = async () => {
      const { data, error } = await supabase
        .from("rescue_points")
        .select("*")
        .eq("active", true)
        .single();

      if (!error && data) {
        setTarget({ lat: data.lat, lng: data.lng });
      } else {
        console.error("目的地の取得に失敗しました", error);
      }
    };

    fetchTarget();
  }, []);

  // ★ 目的地に近づいたら通知（50m以内）
  useEffect(() => {
    if (!position || !target) return;

    const distance = getDistance(
      position[0],
      position[1],
      target.lat,
      target.lng
    );

    if (distance < 50) {
      alert("目的地に到着しました！");
    }
  }, [position, target]);

  if (!position) return <div>位置情報を取得中...</div>;

  return (
    <div className="relative w-full h-full">

      {/* ★ ミニアプリ切り替えアイコン（ON のものだけ表示） */}
      <div className="absolute top-4 left-4 flex flex-col gap-3 z-[9999]">

        {/* 遭難モード */}
        {profile?.paid_sos_mode && profile?.enable_sos_mode && (
          <button
            onClick={() => router.push("/sos")}
            className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg"
          >
            🗺
          </button>
        )}

        {/* 高齢者モード */}
        {profile?.paid_elder_mode && profile?.enable_elder_mode && (
          <button
            onClick={() => router.push("/rescue")}
            className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
          >
            👴
          </button>
        )}

      </div>

      {/* ★ 地図 */}
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} />
      </MapContainer>

      {/* ★ 遭難モードだけ表示（目的地が取得できた時だけ） */}
      {mode === "sos" && target && (
        <>
          <Compass heading={heading} />

          <DirectionArrow
            userLat={position[0]}
            userLng={position[1]}
            targetLat={target.lat}
            targetLng={target.lng}
            heading={heading}
          />

          <DistanceDisplay
            userLat={position[0]}
            userLng={position[1]}
            targetLat={target.lat}
            targetLng={target.lng}
          />
        </>
      )}
    </div>
  );
}
