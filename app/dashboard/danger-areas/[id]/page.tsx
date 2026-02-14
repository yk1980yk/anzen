'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// ★ MapView を SSR 無効で読み込む（これが重要）
const MapView = dynamic(() => import('./MapWrapper'), { ssr: false, loading: () => <p>Loading MapView from [id]/MapView.tsx...</p>, })

export default function DangerAreaDetailPage() {
  const params = useParams()
  const id = params.id

  const [area, setArea] = useState(null)

  useEffect(() => {
    const fetchArea = async () => {
      const { data, error } = await supabase
        .from('danger_areas')
        .select('*')
        .eq('id', id)
        .single()

      if (!error) setArea(data)
    }

    fetchArea()
  }, [id])

  if (!area) return <p>読み込み中...</p>

  return (
    <div className="p-8 space-y-6">
      <a href="/dashboard/danger-areas" className="text-blue-600 underline">
        ← 一覧に戻る
      </a>

      <h1 className="text-2xl font-bold">{area.title}</h1>
      <p>{area.description}</p>

      <p>緯度: {area.latitude}</p>
      <p>経度: {area.longitude}</p>
      <p>範囲: {area.radius}m</p>
      <p>危険レベル: {area.level}</p>

      <p>作成日: {new Date(area.created_at).toLocaleString()}</p>
      <p>更新日: {new Date(area.updated_at).toLocaleString()}</p>

      {/* ★ 地図（SSR 無効なので window エラーが消える） */}
      <MapView
        latitude={area.latitude}
        longitude={area.longitude}
        radius={area.radius}
      />

      <a
        href={`/dashboard/danger-areas/${id}/edit`}
        className="bg-blue-600 text-white px-4 py-2 rounded inline-block"
      >
        編集
      </a>
    </div>
  )
}
