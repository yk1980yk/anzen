'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

// ★ 権限ごとのカード色
const getRoleStyle = (role) => {
  switch (role) {
    case 'admin':
      return 'border-purple-300 bg-purple-50'
    case 'user':
      return 'border-gray-300 bg-white'
    default:
      return 'border-gray-300 bg-gray-50'
  }
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ★ ユーザー情報取得
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (!error) {
        setUser(data)
      }

      setLoading(false)
    }

    fetchUser()
  }, [id])

  if (loading) {
    return <p className="p-8">読み込み中...</p>
  }

  if (!user) {
    return <p className="p-8">ユーザーが見つかりませんでした。</p>
  }

  return (
    <div className="space-y-6">

      {/* 戻るリンク */}
      <Link href="/dashboard/users" className="text-blue-600 underline">
        ← ユーザー一覧に戻る
      </Link>

      {/* タイトル */}
      <h1 className="text-2xl font-bold mb-4">ユーザー詳細</h1>

      {/* カード */}
      <div className={`border p-4 rounded shadow-sm ${getRoleStyle(user.role)}`}>
        <div className="space-y-3">

          <p className="text-lg font-semibold">{user.email}</p>

          <p className="text-gray-700 text-sm">
            名前: {user.name || '未設定'}
          </p>

          <p className="text-gray-700 text-sm">
            権限: {user.role || 'user'}
          </p>

          <p className="text-gray-500 text-xs">
            登録日: {new Date(user.created_at).toLocaleString()}
          </p>

          {/* 将来の機能（BAN / 権限変更）をここに追加できる */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => alert('この機能はまだ実装されていません')}
              className="text-red-600 underline"
            >
              BAN（未実装）
            </button>

            <button
              onClick={() => alert('この機能はまだ実装されていません')}
              className="text-blue-600 underline"
            >
              権限変更（未実装）
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
