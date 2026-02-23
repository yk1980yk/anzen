"use client";

import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type RoutePoint = {
  lat: number;
  lng: number;
  timestamp: string;
};

function RecenterButton({ position, onRecenter }) {
  const map = useMap();

  const handleClick = () => {
    if (position) {
      map.setView(position, 16);
      onRecenter();
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "absolute",
        bottom: 100,
        right: 20,
        zIndex: 1000,
        padding: "10px 14px",
        background: "#1E90FF",
        color: "white",
        borderRadius: 8,
        border: "none",
      }}
    >
      現在地
    </button>
  );
}

export default function RoutePlayback() {
  const searchParams = useSearchParams();
  const routeId = searchParams.get("route_id");

  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [follow, setFollow] = useState(true);

  const mapRef = useRef<any>(null);

  // ★ ルートデータ取得
  const fetchRoute = async () => {
    if (!routeId) return;

    const { data, error } = await supabase
      .from("route_points")
      .select("*")
      .eq("route_id", routeId)
      .order("timestamp", { ascending: true });

    if (!error && data) {
      setPoints(data);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, [routeId]);

  // ★ マーカー位置を補間
  const getInterpolatedPosition = () => {
    if (points.length === 0) return null;

    const total = points.length - 1;
    const index = progress * total;
    const i = Math.floor(index);
    const t = index - i;

    if (i >= total) return points[total];

    const p1 = points[i];
    const p2 = points[i + 1];

    return {
      lat: p1.lat + (p2.lat - p1.lat) * t,
      lng: p1.lng + (p2.lng - p1.lng) * t,
    };
  };

  // ★ 再生アニメーション
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.002 * speed;
        return next >= 1 ? 1 : next;
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const markerPos = getInterpolatedPosition();

  // ★ 追従モード
  useEffect(() => {
    if (follow && mapRef.current && markerPos) {
      mapRef.current.setView(markerPos, 16);
    }
  }, [markerPos, follow]);

  const handleMapMove = () => {
    if (follow) setFollow(false);
  };

  if (!routeId) {
    return (
      <div className="p-6 text-center text-gray-600">
        route_id が指定されていません
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        このルートにはまだポイントがありません
      </div>
    );
  }

  return (
    <div style={{ height: "100dvh", width: "100%", position: "relative" }}>
      <MapContainer
        center={[points[0].lat, points[0].lng]}
        zoom={16}
        whenCreated={(map) => (mapRef.current = map)}
        style={{ height: "100%", width: "100%" }}
        onDragstart={handleMapMove}
        onZoomstart={handleMapMove}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Polyline
          positions={points.map((p) => [p.lat, p.lng])}
          color="blue"
          weight={5}
        />

        {markerPos && <Marker position={markerPos} />}

        <RecenterButton
          position={markerPos}
          onRecenter={() => setFollow(true)}
        />
      </MapContainer>

      {/* 再生コントロール */}
      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.6)",
          padding: "12px 20px",
          borderRadius: 12,
          display: "flex",
          gap: 12,
          color: "white",
        }}
      >
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            background: "#1E90FF",
            color: "white",
            border: "none",
          }}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            background: "#333",
            color: "white",
            border: "none",
          }}
        >
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>
    </div>
  );
}
