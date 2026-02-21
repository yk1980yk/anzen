'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

// ★ カードの色（将来の権限管理にも対応）
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

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // ★ ユーザー一覧取得
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) {
        setUsers(data)
      }

      setLoading(false)
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <p className="px-6 py-8">読み込み中...</p>
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 space-y-6 max-w-3xl mx-auto">

      {/* タイトル */}
      <h1 className="text-2xl font-bold mb-6">ユーザー一覧</h1>

      {users.length === 0 ? (
        <p className="text-gray-600">ユーザーが登録されていません。</p>
      ) : (
        <ul className="space-y-4">
          {users.map((user) => (
            <li
              key={user.id}
              className={`border p-5 rounded-soft shadow-soft ${getRoleStyle(user.role)}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">

                {/* 左側：ユーザー情報 */}
                <div>
                  <p className="text-lg font-semibold">{user.email}</p>
                  <p className="text-gray-700 text-sm mt-1">
                    名前: {user.name || '未設定'}
                  </p>
                  <p className="text-gray-700 text-sm">
                    権限: {user.role || 'user'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    登録日: {new Date(user.created_at).toLocaleString()}
                  </p>
                </div>

                {/* 右側：操作 */}
                <div className="flex items-center">
                  <Link
                    href={`/dashboard/users/${user.id}`}
                    className="text-blue-600 font-medium hover:opacity-80 transition"
                  >
                    詳細 →
                  </Link>
                </div>

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
