"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type AuthUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export default function AuthUserListPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);

  // 通知バナー
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerType, setBannerType] = useState<"success" | "error">("success");

  const showNotification = (message: string, type: "success" | "error") => {
    setBannerMessage(message);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.auth.admin.listUsers();

      if (error) {
        showNotification("ユーザー取得に失敗しました", "error");
      } else if (data?.users) {
        const formatted = data.users.map((u) => ({
          id: u.id,
          email: u.email ?? null,                 // ← ★ 修正済み
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at ?? null, // ← ★ 修正済み
        }));

        setUsers(formatted);
      }

      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 space-y-6">

      {/* 通知バナー */}
      {showBanner && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-soft shadow-strong text-white z-[9999] ${
            bannerType === "success" ? "bg-blue-600" : "bg-red-600"
          }`}
        >
          {bannerMessage}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Authユーザー一覧</h1>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">ユーザーがいません。</p>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white p-5 rounded-soft shadow-soft border border-gray-200"
            >
              <p className="text-lg font-bold">{user.email}</p>

              <p className="text-sm text-gray-600 mt-1">
                作成日: {new Date(user.created_at).toLocaleString()}
              </p>

              <p className="text-sm text-gray-600">
                最終ログイン:{" "}
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "未ログイン"}
              </p>

              <div className="flex gap-3 mt-4">
                <Link
                  href={`/dashboard/auth-users/${user.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-soft shadow-soft hover:bg-blue-700 transition text-sm font-semibold"
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
