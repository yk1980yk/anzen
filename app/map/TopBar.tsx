'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function TopBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  return (
    <div
      className="
        absolute top-0 left-0 w-full
        flex items-center justify-between
        px-4 py-3
        bg-white/80 backdrop-blur-md
        shadow-sm
        z-[9999]
      "
    >
      {/* ANZEN アイコン（モード切り替えボタン） */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center space-x-2
          bg-white shadow-md
          px-3 py-2 rounded-full
          active:scale-95 transition
        "
      >
        <img src="/logos/logo-vertical.png" className="w-6" alt="ANZEN" />
        <span className="text-lg font-bold tracking-wide">ANZEN</span>
      </button>

      {/* 設定ボタン */}
      <button
        onClick={() => router.push('/map/settings')}
        className="
          text-gray-700 text-xl
          px-2 py-1
          rounded-md
          active:scale-95
          transition
        "
      >
        ⚙
      </button>

      {/* モード切り替えメニュー */}
      {open && (
        <div
          className="
            absolute top-16 left-4
            bg-white shadow-lg rounded-xl
            p-4 space-y-3
            z-[9999]
          "
        >
          <button className="w-full text-left">🛡 防犯モード</button>
          <button className="w-full text-left">🚑 救助要請モード</button>
          <button className="w-full text-left">🏃 避難モード</button>
        </div>
      )}
    </div>
  )
}
