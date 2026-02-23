"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useEffect, useState } from "react";

export default function MapPage() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  // 現在地取得
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error("位置情報エラー:", err);
      }
    );
  }, []);

  return (
    <div
      style={{
        height: "100dvh", // ← ★ ここが最重要（スマホで画面が小さくなる問題を解決）
        width: "100%",
      }}
    >
      {position && (
        <MapContainer
          center={position}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* 現在地マーカー */}
          <Marker position={position} />
        </MapContainer>
      )}
    </div>
  );
}
