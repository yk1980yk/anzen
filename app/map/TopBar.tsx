'use client'

import { useRouter } from 'next/navigation'

export default function TopBar() {
  const router = useRouter()

  return (
    <div
      className="
        absolute top-0 left-0 w-full
        flex items-center justify-between
        px-4 py-3
        bg-white/70 backdrop-blur-md
        shadow-sm
        z-[9999]
      "
    >
      <h1 className="text-lg font-bold tracking-wide">ANZEN</h1>

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
    </div>
  )
}
