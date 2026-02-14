'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SettingsPage() {
  const router = useRouter()

  // ★ 設定 state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [level1, setLevel1] = useState(true)
  const [level2, setLevel2] = useState(true)
  const [level3, setLevel3] = useState(true)

  // ★ 初回ロード時に localStorage から読み込む
  useEffect(() => {
    const saved = localStorage.getItem('anzen-settings')
    if (saved) {
      const s = JSON.parse(saved)
      setNotificationsEnabled(s.notificationsEnabled)
      setSoundEnabled(s.soundEnabled)
      setLevel1(s.level1)
      setLevel2(s.level2)
      setLevel3(s.level3)
    }
  }, [])

  // ★ 保存ボタン
  const saveSettings = () => {
    const data = {
      notificationsEnabled,
      soundEnabled,
      level1,
      level2,
      level3,
    }

    localStorage.setItem('anzen-settings', JSON.stringify(data))
    router.push('/map')
  }

  return (
    <div className="p-6 space-y-6 max-w-lg mx-auto">

      <button
        onClick={() => router.push('/map')}
        className="text-blue-600 underline"
      >
        ← 地図に戻る
      </button>

      <h1 className="text-2xl font-bold">設定</h1>

      {/* 通知 */}
      <div className="anzen-card">
        <h2 className="font-semibold mb-2">通知</h2>

        <label className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
          />
          通知を有効にする
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
          音を鳴らす（レベル3）
        </label>
      </div>

      {/* レベル別通知 */}
      <div className="anzen-card">
        <h2 className="font-semibold mb-2">通知する危険レベル</h2>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={level1}
            onChange={(e) => setLevel1(e.target.checked)}
          />
          レベル1（注意）
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={level2}
            onChange={(e) => setLevel2(e.target.checked)}
          />
          レベル2（警告）
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={level3}
            onChange={(e) => setLevel3(e.target.checked)}
          />
          レベル3（緊急）
        </label>
      </div>

      {/* 保存ボタン */}
      <button
        onClick={saveSettings}
        className="w-full bg-blue-600 text-white py-2 rounded shadow active:scale-95 transition"
      >
        保存して戻る
      </button>

      {/* バージョン情報 */}
      <div className="anzen-card">
        <h2 className="font-semibold mb-2">アプリ情報</h2>
        <p className="text-sm text-gray-600">ANZEN v1.0.0</p>
      </div>
    </div>
  )
}
