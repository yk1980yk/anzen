'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import Image from 'next/image'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  // ★ 認証チェック
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
      }
    }

    checkUser()
  }, [router])

  const menuItems = [
    { name: '危険エリア', path: '/dashboard/danger-areas' },
    { name: 'ユーザー', path: '/dashboard/users' },
    { name: '設定', path: '/dashboard/settings' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ★ 左サイドバー */}
      <aside className="w-56 bg-white border-r shadow-sm p-4">
        {/* ← ここにロゴを追加 */}
        <div className="flex items-center mb-6">
          <Image
            src="/logos/logo-header.png"
            alt="ANZEN Header Logo"
            width={140}
            height={40}
            priority
          />
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-3 py-2 rounded ${
                pathname.startsWith(item.path)
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ★ 右側：ページ内容 */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
