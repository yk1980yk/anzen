'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import dynamic from 'next/dynamic'

// ★ 地図コンポーネント
const PublicMap = dynamic(() => import('./publicMap'), { ssr: false })

export default function PublicMapPage() {
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(true)

  // ★ 検索用 state
  const [searchText, setSearchText] = useState('')
  const [filterLevel, setFilterLevel] = useState('all')

  const [selectedArea, setSelectedArea] = useState(null)

  useEffect(() => {
    const fetchAreas = async () => {
      const { data, error } = await supabase
        .from('danger_areas')
        .select('*')

      if (!error) {
        setAreas(data)
      }

      setLoading(false)
    }

    fetchAreas()
  }, [])

  // ★ フィルタリング処理（リアルタイム）
  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      const matchText =
        area.title.toLowerCase().includes(searchText.toLowerCase())

      const matchLevel =
        filterLevel === 'all' || area.level === Number(filterLevel)

      return matchText && matchLevel
    })
  }, [areas, searchText, filterLevel])

  if (loading) {
    return <p className="p-8">読み込み中...</p>
  }

  return (
    <div className="flex h-screen w-screen">

      {/* ★ 左側：サイドバー */}
      <div className="w-80 border-r overflow-y-auto p-4 bg-white">
        <h2 className="text-xl font-bold mb-4">危険エリア検索</h2>

        {/* ★ タイトル検索 */}
        <input
          type="text"
          placeholder="タイトル検索"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-3"
        />

        {/* ★ レベル絞り込み */}
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        >
          <option value="all">すべてのレベル</option>
          <option value="1">レベル1</option>
          <option value="2">レベル2</option>
          <option value="3">レベル3</option>
        </select>

        <h2 className="text-lg font-bold mb-2">検索結果</h2>

        {filteredAreas.map((area) => (
          <div
            key={area.id}
            className={`p-3 mb-3 rounded border cursor-pointer 
              ${area.level === 1 ? 'bg-yellow-50 border-yellow-300' : ''}
              ${area.level === 2 ? 'bg-orange-50 border-orange-300' : ''}
              ${area.level === 3 ? 'bg-red-50 border-red-300' : ''}
              ${selectedArea?.id === area.id ? 'ring-2 ring-blue-400' : ''}
              hover:bg-gray-100`}
            onClick={() => setSelectedArea(area)}
          >
            <p className="font-semibold">{area.title}</p>
            <p className="text-sm text-gray-600">
              レベル: {area.level} / 範囲: {area.radius}m
            </p>
          </div>
        ))}
      </div>

      {/* ★ 右側：地図 */}
      <div className="flex-1">
        <PublicMap areas={filteredAreas} selectedArea={selectedArea} />
      </div>

    </div>
  )
}
