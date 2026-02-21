"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AuthUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export default function AuthUsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.auth.admin.listUsers();

      if (!error && data) {
        const formatted = data.users.map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
        }));

        setUsers(formatted);
      }

      setLoading(false);
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p className="px-6 py-8">読み込み中...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 space-y-6 max-w-3xl mx-auto">

      {/* タイトル + 新規作成 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Authユーザー一覧</h1>

        <Link
          href="/dashboard/auth-users/new"
          className="bg-blue-600 text-white px-4 py-3 rounded-soft shadow-soft hover:bg-blue-700 transition font-semibold"
        >
          新規ユーザー作成
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="text-gray-600">ユーザーが登録されていません。</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="border p-5 rounded-soft bg-white shadow-soft"
            >
              <p className="text-lg font-semibold">{user.email}</p>

              <p className="text-sm text-gray-600 mt-1">
                作成日: {new Date(user.created_at).toLocaleString()}
              </p>

              <p className="text-sm text-gray-600">
                最終ログイン:{" "}
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "未ログイン"}
              </p>

              <div className="mt-4">
                <Link
                  href={`/dashboard/auth-users/${user.id}`}
                  className="bg-blue-600 text-white px-3 py-2 rounded-soft shadow-soft hover:bg-blue-700 transition"
                >
                  詳細
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
