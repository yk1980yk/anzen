'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import dynamic from 'next/dynamic'

// ★ MapView を SSR 無効で読み込む
const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
})

export default function NewDangerAreaPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState(35.681236)   // 初期値：東京駅
  const [longitude, setLongitude] = useState(139.767125)
  const [radius, setRadius] = useState(100)
  const [level, setLevel] = useState(1)

  // ★ 地図クリックで緯度経度を更新
  const handleMapClick = (lat, lng) => {
    setLatitude(lat)
    setLongitude(lng)
  }

  // ★ 半径ドラッグで更新
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { error } = await supabase.from('danger_areas').insert([
      {
        title,
        description,
        latitude,
        longitude,
        radius,
        level,
      },
    ])

    if (!error) {
      alert('危険エリアを作成しました')
      window.location.href = '/dashboard/danger-areas'
    }
  }

  return (
    <div className="p-8 space-y-6">
      <a href="/dashboard/danger-areas" className="text-blue-600 underline">
        ← 一覧に戻る
      </a>

      <h1 className="text-2xl font-bold">危険エリアを追加</h1>

      {/* ★ フォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold">タイトル</label>
          <input
            className="border p-2 w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">説明</label>
          <textarea
            className="border p-2 w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold">緯度</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">経度</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">範囲（m）</label>
          <input
            type="number"
            className="border p-2 w-full"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block font-semibold">危険レベル</label>
          <select
            className="border p-2 w-full"
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value))}
          >
            <option value={1}>レベル1（低）</option>
            <option value={2}>レベル2（中）</option>
            <option value={3}>レベル3（高）</option>
          </select>
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          作成
        </button>
      </form>

      {/* ★ フォームの下に地図を表示 */}
      <div className="mt-6">
        <MapView
          latitude={latitude}
          longitude={longitude}
          radius={radius}
          level={level}
          onMapClick={handleMapClick}
          onRadiusChange={handleRadiusChange}
        />
      </div>
    </div>
  )
}
