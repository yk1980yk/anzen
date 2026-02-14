'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// ★ MapView を SSR 無効で読み込む
const MapView = dynamic(() => import('../MapView'), {
  ssr: false,
})

export default function EditDangerAreaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState(35.681236)
  const [longitude, setLongitude] = useState(139.767125)
  const [radius, setRadius] = useState(100)
  const [level, setLevel] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ★ 初期データを読み込む
  useEffect(() => {
    const fetchArea = async () => {
      const { data, error } = await supabase
        .from('danger_areas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError('データの取得に失敗しました')
      } else {
        setTitle(data.title)
        setDescription(data.description || '')
        setLatitude(data.latitude)
        setLongitude(data.longitude)
        setRadius(data.radius)
        setLevel(data.level)
      }

      setLoading(false)
    }

    fetchArea()
  }, [id])

  // ★ 地図クリックで緯度経度を更新
  const handleMapClick = (lat, lng) => {
    setLatitude(lat)
    setLongitude(lng)
  }

  // ★ 半径ドラッグで更新
  const handleRadiusChange = (newRadius) => {
    setRadius(newRadius)
  }

  // ★ 更新処理
  const handleUpdate = async () => {
    setError('')

    const { error } = await supabase
      .from('danger_areas')
      .update({
        title,
        description,
        latitude,
        longitude,
        radius,
        level,
        updated_at: new Date(),
      })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard/danger-areas')
    }
  }

  if (loading) {
    return <p className="p-8">読み込み中...</p>
  }

  return (
    <div className="p-8 space-y-6">
      <a href="/dashboard/danger-areas" className="text-blue-600 underline">
        ← 一覧に戻る
      </a>

      <h1 className="text-2xl font-bold">危険エリアを編集</h1>

      {/* ★ フォーム */}
      <div className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        <textarea
          placeholder="説明（任意）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="number"
          placeholder="緯度"
          value={latitude}
          onChange={(e) => setLatitude(parseFloat(e.target.value))}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="number"
          placeholder="経度"
          value={longitude}
          onChange={(e) => setLongitude(parseFloat(e.target.value))}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="number"
          placeholder="範囲（メートル）"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="w-full border px-4 py-2 rounded"
        />

        <select
          value={level}
          onChange={(e) => setLevel(parseInt(e.target.value))}
          className="w-full border px-4 py-2 rounded"
        >
          <option value={1}>レベル 1（低）</option>
          <option value={2}>レベル 2</option>
          <option value={3}>レベル 3</option>
        </select>

        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          更新する
        </button>
      </div>

      {/* ★ 地図（新規作成ページと同じ UX） */}
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
