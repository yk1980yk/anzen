'use client'

import { MapContainer, TileLayer, Circle, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// ★ Leaflet のアイコンずれ対策
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

// ★ 危険レベルごとの円の色
const getCircleColor = (level: number) => {
  switch (level) {
    case 1:
      return '#60A5FA' // 青
    case 2:
      return '#34D399' // 緑
    case 3:
      return '#FBBF24' // 黄
    case 4:
      return '#FB923C' // オレンジ
    case 5:
      return '#EF4444' // 赤
    default:
      return '#9CA3AF' // グレー
  }
}

export default function MiniMap({
  latitude,
  longitude,
  radius,
  level,
}: {
  latitude: number
  longitude: number
  radius: number
  level: number
}) {
  return (
    <div className="w-full h-48 rounded-lg overflow-hidden shadow border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ピン */}
        <Marker position={[latitude, longitude]} />

        {/* 危険エリアの円 */}
        <Circle
          center={[latitude, longitude]}
          radius={radius}
          pathOptions={{
            color: getCircleColor(level),
            fillColor: getCircleColor(level),
            fillOpacity: 0.3,
          }}
        />
      </MapContainer>
    </div>
  )
}
