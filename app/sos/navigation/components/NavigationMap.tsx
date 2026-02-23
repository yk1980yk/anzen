"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// デフォルトマーカー修正（Next.js で必要）
const DefaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function NavigationMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div
      style={{
        height: "100dvh", // ← スマホでも本当の画面高さになる
        width: "100%",
        overflow: "hidden", // ← スクロールを完全に防止
      }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[lat, lng]}>
          <Popup>あなたの現在地</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
