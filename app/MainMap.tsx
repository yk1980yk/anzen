"use client";

import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import L from "leaflet";
import { anzenMapStyle, currentLocationIcon } from "@/components/map/AnzenMapStyles";
import { useRouter } from "next/navigation";

// Danger Area アイコン（赤）
const dangerIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:22px;
    height:22px;
    background:#E53935;
    border-radius:50%;
    border:3px solid white;
    box-shadow:0 0 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export default function MainMap() {
  const router = useRouter();
  const mapRef = useRef<any>(null);

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [dangerAreas, setDangerAreas] = useState<any[]>([]);

  // 現在地取得
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => alert("位置情報が取得できませんでした")
    );
  }, []);

  // danger_areas 取得
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("danger_areas")
        .select("*")
        .order("created_at", { ascending: false });

      setDangerAreas(data || []);
    };

    load();
  }, []);

  // 現在地に戻るイベント
  useEffect(() => {
    const handler = () => {
      if (mapRef.current && position) {
        mapRef.current.setView(position, 16);
      }
    };

    window.addEventListener("recenter-map", handler);
    return () => window.removeEventListener("recenter-map", handler);
  }, [position]);

  if (!position) return null;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={position}
        zoom={16}
        style={anzenMapStyle}
        whenReady={() => {
          // whenReady の中で map インスタンスを取得
          const map = (window as any).L?.map || null;
          if (!mapRef.current && map) {
            mapRef.current = map;
          }
        }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 現在地 */}
        <Marker position={position} icon={currentLocationIcon} />

        {/* Danger Areas */}
        {dangerAreas.map((area) => (
          <Marker
            key={area.id}
            position={[area.latitude, area.longitude]}
            icon={dangerIcon}
            eventHandlers={{
              click: () =>
                router.push(`/dashboard/danger-areas/${area.id}/edit`),
            }}
          />
        ))}

        {/* Danger Area の範囲 */}
        {dangerAreas.map((area) => (
          <Circle
            key={`circle-${area.id}`}
            center={[area.latitude, area.longitude]}
            radius={area.radius}
            pathOptions={{
              color: "#E53935",
              fillColor: "#E53935",
              fillOpacity: 0.15,
            }}
          />
        ))}
      </MapContainer>

      {/* 投稿ボタン（＋） */}
      <button
        onClick={() => router.push("/dashboard/danger-areas/new")}
        className="absolute bottom-6 right-6 bg-[#1976D2] text-white text-3xl w-14 h-14 rounded-full shadow-strong flex items-center justify-center"
        style={{ zIndex: 9999 }}
      >
        ＋
      </button>
    </div>
  );
}
