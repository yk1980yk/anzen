"use client";

import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white text-center">

      {/* ロゴ */}
      <img src="/logo.png" alt="ANZEN" className="w-20 mb-6 opacity-90" />

      <h1 className="text-3xl font-bold text-gray-800 mb-2">ページが見つかりません</h1>
      <p className="text-gray-600 mb-8">
        お探しのページは存在しないか、移動された可能性があります。
      </p>

      {/* ボタン */}
      <button
        onClick={() => router.push("/")}
        className="anzen-btn-primary max-w-xs"
      >
        ホームに戻る
      </button>

      <button
        onClick={() => router.push("/user-map")}
        className="anzen-btn-secondary max-w-xs mt-3"
      >
        地図を見る
      </button>

    </div>
  );
}
