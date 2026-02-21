"use client";

import { MapContainer, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MiniMap({ latitude, longitude, radius, level }) {
  const center = [latitude, longitude];

  const levelColors = {
    1: "#FFD700",
    2: "#FF8C00",
    3: "#FF4500",
    4: "#FF0000",
    5: "#8B0000",
  };

  return (
    <div style={{ height: "150px", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full rounded"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Circle
          center={center}
          radius={radius}
          pathOptions={{
            color: levelColors[level],
            fillColor: levelColors[level],
            fillOpacity: 0.25,
          }}
        />
      </MapContainer>
    </div>
  );
}
