"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

// -----------------------------
// マーカーアイコン
// -----------------------------
const redIcon = L.icon({
  iconUrl: "/marker-red.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const yellowIcon = L.icon({
  iconUrl: "/marker-yellow.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const blueIcon = L.icon({
  iconUrl: "/marker-blue.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 危険エリア内SOS用の強調マーカー
const dangerIcon = L.icon({
  iconUrl: "/marker-danger.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [30, 48],
  iconAnchor: [15, 48],
});

// -----------------------------
// 地図移動アニメーション
// -----------------------------
function FlyToPosition({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

// -----------------------------
// 危険レベル → 色（ANZEN統一）
// -----------------------------
const levelColors = {
  1: "#3b82f6",
  2: "#22c55e",
  3: "#eab308",
  4: "#f97316",
  5: "#ef4444",
} as const;

// -----------------------------
// 危険レベル → 円の太さ
// -----------------------------
const levelStroke = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
} as const;

// -----------------------------
// 危険レベル → 塗りの透明度
// -----------------------------
const levelOpacity = {
  1: 0.15,
  2: 0.2,
  3: 0.25,
  4: 0.3,
  5: 0.35,
} as const;

// -----------------------------
// AdminMap 本体
// -----------------------------
export default function AdminMap({
  logs,
  dangerAreas,
  dangerInsideMap,
  onMarkerClick,
  onEditDangerArea,
  onCreateDangerArea,
  focus,
}: {
  logs: {
    id: string;
    mode: string;
    lat: number;
    lng: number;
    created_at: string;
  }[];
  dangerAreas: {
    id: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    radius: number;
    type: string;
    level: 1 | 2 | 3 | 4 | 5;
    created_at: string;
  }[];
  dangerInsideMap: Record<string, boolean>;
  onMarkerClick: (id: string) => void;
  onEditDangerArea: (area: any) => void;
  onCreateDangerArea: (lat: number, lng: number) => void;
  focus: { lat: number; lng: number } | null;
}) {
  if (logs.length === 0) return null;

  const latest = logs[0];

  const mapRef = useRef<any>(null);

  // -----------------------------
  // Marker に className を付ける正しい方法（v4対応）
  // -----------------------------
  const getIcon = (logId: string, mode: string, isLatest: boolean) => {
    const baseIcon =
      dangerInsideMap[logId]
        ? dangerIcon
        : mode === "disaster"
        ? redIcon
        : mode === "elderly"
        ? yellowIcon
        : blueIcon;

    return L.icon({
      ...baseIcon.options,
      className: isLatest ? "danger-pulse" : "",
    });
  };

  return (
    <MapContainer
      center={[latest.lat, latest.lng]}
      zoom={14}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      whenReady={() => {
        const map = mapRef.current;
        if (!map) return;

        map.on("click", (e: any) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          onCreateDangerArea(lat, lng);
        });
      }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {focus && <FlyToPosition lat={focus.lat} lng={focus.lng} />}

      {dangerAreas.map((area) => (
        <Circle
          key={area.id}
          center={[area.latitude, area.longitude]}
          radius={area.radius}
          pathOptions={{
            color: levelColors[area.level],
            fillColor: levelColors[area.level],
            weight: levelStroke[area.level],
            fillOpacity: levelOpacity[area.level],
          }}
          className="danger-pulse"
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-bold">{area.title}</p>
              <p>📍 緯度: {area.latitude}</p>
              <p>📍 経度: {area.longitude}</p>
              <p>📏 半径: {area.radius} m</p>
              <p>🔥 危険レベル: {area.level}</p>

              {area.description && (
                <p className="mt-2">📝 {area.description}</p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                🕒 {new Date(area.created_at).toLocaleString()}
              </p>

              <button
                onClick={() => onEditDangerArea(area)}
                className="mt-2 px-3 py-2 bg-blue-600 text-white rounded-soft shadow-soft hover:bg-blue-700 transition font-semibold"
              >
                編集する
              </button>
            </div>
          </Popup>
        </Circle>
      ))}

      {logs.map((log, index) => (
        <Marker
          key={log.id}
          position={[log.lat, log.lng]}
          icon={getIcon(log.id, log.mode, index === 0)}
          eventHandlers={{
            click: () => onMarkerClick(log.id),
          }}
        >
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-bold">
                {log.mode === "disaster"
                  ? "災害SOS"
                  : log.mode === "elderly"
                  ? "高齢者SOS"
                  : "遭難SOS"}
              </p>

              <p>緯度: {log.lat}</p>
              <p>経度: {log.lng}</p>

              <p className="text-xs text-gray-500">
                {new Date(log.created_at).toLocaleString()}
              </p>

              {dangerInsideMap[log.id] && (
                <p className="text-red-600 font-bold mt-2">
                  ⚠ 危険エリア内で発生
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
