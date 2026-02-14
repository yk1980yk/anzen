'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// ★ MiniMap を SSR 無効で読み込む
const MiniMap = dynamic(() => import('./MiniMap'), {
  ssr: false,
})

export default function DangerAreasPage() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 一覧データ取得
  const fetchAreas = async () => {
    const { data, error } = await supabase
      .from('danger_areas')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setAreas(data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchAreas()
  }, [])

  // 削除処理
  const handleDelete = async (id) => {
    const ok = confirm('本当に削除しますか？')
    if (!ok) return

    const { error } = await supabase
      .from('danger_areas')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchAreas()
    }
  }

  if (loading) {
    return <p className="p-8">読み込み中...</p>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">危険エリア一覧</h1>

      {areas.length === 0 ? (
        <p>まだ危険エリアが登録されていません。</p>
      ) : (
        <ul className="space-y-6">
          {areas.map((area) => (
            <li
              key={area.id}
              className="border p-4 rounded bg-white shadow-sm"
            >
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* ★ 左側：ミニマップ */}
                <div className="w-full md:w-1/3">
                  <MiniMap
                    latitude={area.latitude}
                    longitude={area.longitude}
                    radius={area.radius}
                    level={area.level}
                  />
                </div>

                {/* ★ 右側：テキスト情報 */}
                <div className="flex-1">
                  <h2
                    className="text-xl font-semibold text-blue-600 underline cursor-pointer"
                    onClick={() => router.push(`/dashboard/danger-areas/${area.id}`)}
                  >
                    {area.title}
                  </h2>

                  <p className="text-gray-700">{area.description}</p>

                  <p className="mt-2 text-sm">
                    緯度: {area.latitude} / 経度: {area.longitude}
                  </p>
                  <p className="text-sm">範囲: {area.radius}m</p>
                  <p className="text-sm font-bold">危険レベル: {area.level}</p>

                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/danger-areas/${area.id}/edit`)
                      }
                      className="text-blue-600 underline"
                    >
                      編集
                    </button>

                    <button
                      onClick={() => handleDelete(area.id)}
                      className="text-red-600 underline"
                    >
                      削除
                    </button>
                  </div>
                </div>

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
