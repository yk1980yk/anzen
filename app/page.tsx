"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">

      {/* ロゴ */}
      <div className="mb-10 text-center">
        <img src="/logo.png" alt="ANZEN" className="w-20 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">ANZEN</h1>
        <p className="text-gray-600 mt-2">あなたの安全を、いつでもどこでも。</p>
      </div>

      {/* メインボタン */}
      <div className="w-full max-w-sm space-y-4">

        <button
          onClick={() => router.push("/user-map")}
          className="anzen-btn-primary"
        >
          地図を見る
        </button>

        <button
          onClick={() => router.push("/dashboard/danger-areas/new")}
          className="anzen-btn-primary"
        >
          危険エリアを投稿
        </button>

        <button
          onClick={() => router.push("/mypage")}
          className="anzen-btn-secondary"
        >
          マイページ
        </button>

      </div>

      {/* サブメニュー */}
      <div className="mt-10 space-y-3 text-center">

        <button
          onClick={() => router.push("/settings")}
          className="text-blue-600 underline"
        >
          設定
        </button>

        <button
          onClick={() => router.push("/login")}
          className="text-red-600 underline"
        >
          ログアウト
        </button>

      </div>

    </div>
  );
}
