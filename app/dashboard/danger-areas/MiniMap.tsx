'use client'

import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Leaflet のアイコン修正
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
L.Marker.prototype.options.icon = DefaultIcon

// 危険レベルごとの色
const getLevelColor = (level) => {
  if (level === 1) return { color: '#FFD700', fillColor: '#FFD700' } // 黄色
  if (level === 2) return { color: '#FF8C00', fillColor: '#FF8C00' } // オレンジ
  return { color: '#FF0000', fillColor: '#FF0000' } // 赤
}

export default function MiniMap({ latitude, longitude, radius, level }) {
  const levelColor = getLevelColor(level)

  return (
    <div style={{ height: '150px', width: '100%' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        zoomControl={false}
        className="h-full w-full rounded"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[latitude, longitude]} />

        <Circle
          center={[latitude, longitude]}
          radius={radius}
          pathOptions={{
            color: levelColor.color,
            fillColor: levelColor.fillColor,
            fillOpacity: 0.25,
          }}
        />
      </MapContainer>
    </div>
  )
}
