"use client";

import { MapContainer, TileLayer, Marker, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter, useParams } from "next/navigation";
import { getCityCategory } from "@/lib/cityCategory";

// ANZEN ピンアイコン
const AnzenIcon = L.icon({
  iconUrl: "/icons/app-icon.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// 危険レベルごとの色
const getLevelColor = (level) => {
  switch (level) {
    case 1:
      return { color: "#FFD700", fillColor: "#FFD700" };
    case 2:
      return { color: "#FF8C00", fillColor: "#FF8C00" };
    case 3:
      return { color: "#FF4500", fillColor: "#FF4500" };
    case 4:
      return { color: "#FF0000", fillColor: "#FF0000" };
    case 5:
      return { color: "#8B0000", fillColor: "#8B0000" };
    default:
      return { color: "#FF0000", fillColor: "#FF0000" };
  }
};

export default function MapViewList({ dangerAreas, visibleLevels }) {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  // 地図の中心（最初のエリア or 東京駅）
  const center = dangerAreas.length
    ? [dangerAreas[0].latitude, dangerAreas[0].longitude]
    : [35.681236, 139.767125];

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full rounded"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {dangerAreas
          .filter((a) => visibleLevels.includes(a.level))
          .map((area) => {
            const color = getLevelColor(area.level);

            // ★ 都市カテゴリー判定（largeCity / midCity / rural）
            const category = getCityCategory(area.city);

            return (
              <div key={area.id}>
                {/* ピン（クリックで詳細へ） */}
                <Marker
                  position={[area.latitude, area.longitude]}
                  icon={AnzenIcon}
                  eventHandlers={{
                    click: () =>
                      router.push(
                        `/groups/${groupId}/danger-areas/${area.id}`
                      ),
                  }}
                />

                {/* 危険範囲の円（都市カテゴリーで揺れ幅が変わる） */}
                <Circle
                  center={[area.latitude, area.longitude]}
                  radius={area.radius}
                  pathOptions={{
                    color: color.color,
                    fillColor: color.fillColor,
                    fillOpacity: 0.25,
                  }}
                  className={`danger-pulse-${category}`}
                />
              </div>
            );
          })}
      </MapContainer>
    </div>
  );
}
