'use client'

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Leaflet のアイコン修正
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
L.Marker.prototype.options.icon = DefaultIcon

// ★ 地図クリックで緯度経度を親に渡す
function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ★ 危険レベルごとの色
const getLevelColor = (level) => {
  if (level === 1) return { color: '#FFD700', fillColor: '#FFD700' } // 黄色
  if (level === 2) return { color: '#FF8C00', fillColor: '#FF8C00' } // オレンジ
  return { color: '#FF0000', fillColor: '#FF0000' } // 赤
}

export default function MapView({
  latitude,
  longitude,
  radius,
  level,
  onMapClick,
  onRadiusChange,
}) {
  // ★ 半径ハンドルの位置（中心から radius メートル東方向）
  const handleLat = latitude
  const handleLng = longitude + radius / 111320

  const levelColor = getLevelColor(level)

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full rounded"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* ★ クリックイベント */}
        <ClickHandler onClick={onMapClick} />

        {/* ★ 中心マーカー */}
        <Marker position={[latitude, longitude]} />

        {/* ★ 危険レベルに応じた円 */}
        <Circle
          center={[latitude, longitude]}
          radius={radius}
          pathOptions={{
            color: levelColor.color,
            fillColor: levelColor.fillColor,
            fillOpacity: 0.25,
          }}
        />

        {/* ★ 半径変更ハンドル */}
        <Marker
          position={[handleLat, handleLng]}
          draggable={true}
          eventHandlers={{
            drag(e) {
              const newPos = e.target.getLatLng()

              // 中心との距離を計算して radius を更新
              const R = 6371000
              const dLat = (newPos.lat - latitude) * (Math.PI / 180)
              const dLng = (newPos.lng - longitude) * (Math.PI / 180)
              const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(latitude * (Math.PI / 180)) *
                  Math.cos(newPos.lat * (Math.PI / 180)) *
                  Math.sin(dLng / 2) ** 2
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
              const newRadius = R * c

              onRadiusChange(Math.round(newRadius))
            },
          }}
        />
      </MapContainer>
    </div>
  )
}
