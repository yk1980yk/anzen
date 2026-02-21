"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";

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

export default function AuthUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
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
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.admin.getUserById(id);

      if (!error && data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at,
          last_sign_in_at: data.user.last_sign_in_at,
        });
      }

      setLoading(false);
    };

    fetchUser();
  }, [id]);

  // Edge Function を呼び出す削除処理
  const handleDelete = async () => {
    const confirmDelete = window.confirm("本当に削除しますか？");
    if (!confirmDelete) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-user-delete`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      }
    );

    const result = await res.json();

    if (result.success) {
      showNotification("ユーザーを削除しました", "success");
      setTimeout(() => router.push("/dashboard/auth-users"), 800);
    } else {
      showNotification("削除に失敗しました: " + result.error, "error");
    }
  };

  if (loading) return <p className="px-6 py-8">読み込み中...</p>;
  if (!user) return <p className="px-6 py-8">ユーザーが見つかりません。</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 max-w-2xl mx-auto space-y-6">

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

      <h1 className="text-2xl font-bold">Authユーザー詳細</h1>

      <div className="border p-5 rounded-soft bg-white shadow-soft space-y-4">

        <p className="text-lg font-semibold">{user.email}</p>

        <div className="text-sm text-gray-600 space-y-1">
          <p>ユーザーID: {user.id}</p>
          <p>作成日: {new Date(user.created_at).toLocaleString()}</p>
          <p>
            最終ログイン:{" "}
            {user.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleString()
              : "未ログイン"}
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-3 rounded-soft shadow-soft hover:bg-red-700 transition font-semibold"
          >
            削除
          </button>

          <button
            onClick={() => router.push("/dashboard/auth-users")}
            className="bg-gray-500 text-white px-4 py-3 rounded-soft shadow-soft hover:bg-gray-600 transition font-semibold"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  );
}
