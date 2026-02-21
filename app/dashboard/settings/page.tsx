'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  const [authUser, setAuthUser] = useState(null) // ← Supabase Auth のユーザー
  const [user, setUser] = useState(null) // ← users テーブルのユーザー
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // ★ ログイン中のユーザー情報を取得
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
        return
      }

      setAuthUser(data.user) // ← email はここに入っている

      // users テーブルから詳細を取得
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      setUser(userData)
      setName(userData?.name || '')
      setLoading(false)
    }

    fetchUser()
  }, [router])

  // ★ 名前更新
  const handleUpdateName = async () => {
    setMessage('')

    const { error } = await supabase
      .from('users')
      .update({ name })
      .eq('id', user.id)

    if (error) {
      setMessage('更新に失敗しました')
    } else {
      setMessage('名前を更新しました')
    }
  }

  // ★ ログアウト
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <p className="px-6 py-8">読み込み中...</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 max-w-xl mx-auto space-y-6">

      {/* タイトル */}
      <h1 className="text-2xl font-bold mb-4">設定</h1>

      {/* プロフィールカード */}
      <div className="anzen-card p-5 space-y-4">
        {/* ★ email は authUser から取得 */}
        <p className="text-lg font-semibold">{authUser.email}</p>

        <div className="space-y-2">
          <label className="text-sm font-semibold">名前</label>
          <input
            type="text"
            value={name}
            placeholder="名前を入力"
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-soft px-4 py-3 shadow-soft focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          onClick={handleUpdateName}
          className="bg-blue-600 text-white py-3 rounded-soft shadow-soft w-full hover:bg-blue-700 transition font-semibold"
        >
          名前を更新
        </button>
      </div>

      {/* ログアウト */}
      <div className="max-w-xl">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white py-3 rounded-soft shadow-soft w-full hover:bg-red-700 transition font-semibold"
        >
          ログアウト
        </button>
      </div>

    </div>
  )
}
