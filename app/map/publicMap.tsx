'use client'

import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import NotificationBanner from './NotificationBanner'
import TopBar from './TopBar'

/* ============================================================
   レベル別マーカー
============================================================ */
const getMarkerIcon = (level) => {
  const color =
    level === 1 ? '#FFD700' : level === 2 ? '#FF8C00' : '#FF0000'

  const pulseClass = level === 3 ? 'danger-pulse' : ''

  return L.divIcon({
    className: pulseClass,
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

/* ============================================================
   現在地マーカー
============================================================ */
const currentLocationIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 14px;
      height: 14px;
      background: #007bff;
      border-radius: 50%;
      border: 2px solid white;
    "></div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

/* ============================================================
   レベル別の円の色
============================================================ */
const getLevelColor = (level) => {
  if (level === 1) return { color: '#FFD700', fillColor: '#FFD700' }
  if (level === 2) return { color: '#FF8C00', fillColor: '#FF8C00' }
  return { color: '#FF0000', fillColor: '#FF0000' }
}

/* ============================================================
   距離計算
============================================================ */
const calcDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/* ============================================================
   サイドバー選択で地図移動
============================================================ */
function FlyToSelected({ selectedArea }) {
  const map = useMap()

  useEffect(() => {
    if (selectedArea) {
      map.flyTo([selectedArea.latitude, selectedArea.longitude], 16)
    }
  }, [selectedArea])

  return null
}

/* ============================================================
   ★ 地図ロジック（追従モード・ドラッグ停止）
============================================================ */
function MapLogic({ userLocation, setUserLocation, isFollowing, setIsFollowing }) {
  const map = useMap()

  /* --- 地図ドラッグで追従停止 --- */
  useEffect(() => {
    if (!map) return

    const stopFollowing = () => setIsFollowing(false)
    map.on("dragstart", stopFollowing)

    return () => map.off("dragstart", stopFollowing)
  }, [map])

  /* --- 現在地追従 --- */
  useEffect(() => {
    if (!navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ latitude, longitude })

        if (isFollowing && map) {
          map.setView([latitude, longitude])
        }
      },
      () => {},
      { enableHighAccuracy: true }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [map, isFollowing])

  return null
}

/* ============================================================
   現在地ボタン（追従再開）
============================================================ */
function LocateButton({ setUserLocation, setIsFollowing }) {
  const map = useMap()

  const handleLocate = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords
      setUserLocation({ latitude, longitude })

      setIsFollowing(true)
      map.setView([latitude, longitude], 16)
    })
  }

  return (
    <button
      onClick={handleLocate}
      className="anzen-button absolute top-20 right-4 z-[9999]"
    >
      現在地
    </button>
  )
}

/* ============================================================
   メイン
============================================================ */
export default function PublicMap({ areas, selectedArea }) {
  const router = useRouter()

  const [userLocation, setUserLocation] = useState(null)
  const [notifiedAreas, setNotifiedAreas] = useState([])

  const [bannerMessage, setBannerMessage] = useState('')
  const [bannerLevel, setBannerLevel] = useState(1)

  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    soundEnabled: true,
    level1: true,
    level2: true,
    level3: true,
  })

  useEffect(() => {
    const saved = localStorage.getItem('anzen-settings')
    if (saved) setSettings(JSON.parse(saved))
  }, [])

  /* --- 追従モード --- */
  const [isFollowing, setIsFollowing] = useState(true)

  /* ============================================================
     ★ 表示時刻フィルタ（未来の投稿は非表示）
  ============================================================ */
  const now = new Date()
  const visibleAreas = areas.filter((area) => {
    if (!area.display_time) return true
    return new Date(area.display_time) <= now
  })

  /* ============================================================
     危険エリアとの距離判定（通知）
  ============================================================ */
  useEffect(() => {
    if (!userLocation) return

    visibleAreas.forEach((area) => {
      const distance = calcDistance(
        userLocation.latitude,
        userLocation.longitude,
        area.latitude,
        area.longitude
      )

      if (!settings.notificationsEnabled) return
      if (area.level === 1 && !settings.level1) return
      if (area.level === 2 && !settings.level2) return
      if (area.level === 3 && !settings.level3) return

      if (distance <= area.radius && !notifiedAreas.includes(area.id)) {
        let message = ''

        if (area.level === 1) message = `注意: ${area.title} の近くにいます`
        if (area.level === 2) message = `⚠ 警告: ${area.title} に接近しています`
        if (area.level === 3) {
          message = `🚨 緊急: ${area.title} の危険エリアに侵入しました`
          if (settings.soundEnabled) {
            const audio = new Audio('/alert.mp3')
            audio.play().catch(() => {})
          }
        }

        setBannerMessage(message)
        setBannerLevel(area.level)
        setTimeout(() => setBannerMessage(''), 4000)

        setNotifiedAreas((prev) => [...prev, area.id])
      }
    })
  }, [userLocation, visibleAreas, notifiedAreas, settings])

  /* ============================================================
     レンダリング
  ============================================================ */
  return (
    <div className="relative h-full w-full">

      <TopBar />

      <NotificationBanner message={bannerMessage} level={bannerLevel} />

      <MapContainer
        center={[35.681236, 139.767125]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full leaflet-bottom leaflet-right"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <FlyToSelected selectedArea={selectedArea} />

        {/* ★ 追従モードロジック */}
        <MapLogic
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          isFollowing={isFollowing}
          setIsFollowing={setIsFollowing}
        />

        {/* ★ 現在地ボタン */}
        <LocateButton
          setUserLocation={setUserLocation}
          setIsFollowing={setIsFollowing}
        />

        {/* 現在地 */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={currentLocationIcon}
            />

            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={20}
              pathOptions={{
                color: '#007bff',
                fillColor: '#007bff',
                fillOpacity: 0.2,
              }}
            />
          </>
        )}

        {/* 危険エリア（★ visibleAreas を使用） */}
        {visibleAreas.map((area) => {
          const levelColor = getLevelColor(area.level)
          const isDanger = area.level === 3

          return (
            <div key={area.id}>
              <Marker
                position={[area.latitude, area.longitude]}
                icon={getMarkerIcon(area.level)}
              >
                <Popup>
                  <div className="rounded overflow-hidden shadow-md">

                    <div
                      className={`
                        px-3 py-2 text-white font-bold
                        ${area.level === 1 ? 'bg-yellow-500' : ''}
                        ${area.level === 2 ? 'bg-orange-500' : ''}
                        ${area.level === 3 ? 'bg-red-600 danger-pulse' : ''}
                      `}
                    >
                      {area.title}
                    </div>

                    <div className="p-3 space-y-1 bg-white">
                      <p className="text-sm text-gray-700">{area.description}</p>
                      <p className="text-sm font-semibold">
                        レベル: {area.level} / 範囲: {area.radius}m
                      </p>

                      <button
                        onClick={() =>
                          router.push(`/dashboard/danger-areas/${area.id}`)
                        }
                        className="mt-2 text-blue-600 underline"
                      >
                        詳細を見る
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>

              <Circle
                center={[area.latitude, area.longitude]}
                radius={area.radius}
                pathOptions={{
                  color: levelColor.color,
                  fillColor: levelColor.fillColor,
                  fillOpacity: 0.25,
                }}
                className={isDanger ? 'danger-pulse' : ''}
              />
            </div>
          )
        })}
      </MapContainer>
    </div>
  )
}
