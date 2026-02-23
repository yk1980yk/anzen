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
import { useEffect, useState } from 'react'

// -----------------------------
// ★ Props 型定義（これが超重要）
// -----------------------------
type MapViewProps = {
  latitude: number
  longitude: number
  radius: number
  level: number
  readOnly?: boolean
  onMapClick?: (lat: number, lng: number) => void
  onRadiusChange?: (radius: number) => void
  onCenterDrag?: (lat: number, lng: number) => void
}

// Leaflet のアイコン修正
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
L.Marker.prototype.options.icon = DefaultIcon

// ★ 地図クリックで緯度経度を親に渡す
function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ★ 危険レベルごとの色
const getLevelColor = (level: number) => {
  switch (level) {
    case 1:
      return { color: "#FFD700", fillColor: "#FFD700" }
    case 2:
      return { color: "#FF8C00", fillColor: "#FF8C00" }
    case 3:
      return { color: "#FF4500", fillColor: "#FF4500" }
    case 4:
      return { color: "#FF0000", fillColor: "#FF0000" }
    case 5:
      return { color: "#8B0000", fillColor: "#8B0000" }
    default:
      return { color: "#FF0000", fillColor: "#FF0000" }
  }
}


export default function MapView({
  latitude,
  longitude,
  radius,
  level,
  readOnly = false,
  onMapClick,
  onRadiusChange,
  onCenterDrag,
}: MapViewProps) {
  const [center, setCenter] = useState<[number, number]>([latitude, longitude])

  useEffect(() => {
    setCenter([latitude, longitude])
  }, [latitude, longitude])

  const handleLat = center[0]
  const handleLng = center[1] + radius / 111320

  const levelColor = getLevelColor(level)

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full rounded"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* クリックイベント（readOnly のとき無効） */}
        {!readOnly && onMapClick && <ClickHandler onClick={onMapClick} />}

        {/* 中心マーカー */}
        <Marker
          position={center}
          draggable={!readOnly}
          eventHandlers={
            !readOnly
              ? {
                  dragend: (e) => {
                    const pos = e.target.getLatLng()
                    setCenter([pos.lat, pos.lng])
                    onCenterDrag?.(pos.lat, pos.lng)
                  },
                }
              : {}
          }
        />

        {/* 危険レベルの円 */}
        <Circle
          center={center}
          radius={radius}
          pathOptions={{
            color: levelColor.color,
            fillColor: levelColor.fillColor,
            fillOpacity: 0.25,
          }}
        />

        {/* 半径変更ハンドル（readOnly のとき非表示） */}
        {!readOnly && (
          <Marker
            position={[handleLat, handleLng]}
            draggable={true}
            eventHandlers={{
              drag(e) {
                const newPos = e.target.getLatLng()

                const R = 6371000
                const dLat = (newPos.lat - center[0]) * (Math.PI / 180)
                const dLng = (newPos.lng - center[1]) * (Math.PI / 180)
                const a =
                  Math.sin(dLat / 2) ** 2 +
                  Math.cos(center[0] * (Math.PI / 180)) *
                    Math.cos(newPos.lat * (Math.PI / 180)) *
                    Math.sin(dLng / 2) ** 2
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                const newRadius = R * c

                onRadiusChange?.(Math.round(newRadius))
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}
