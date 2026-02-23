"use client";

import { useRouter } from "next/navigation";

export default function ModeSwitcher({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div
      className="absolute top-4 left-4 bg-white rounded-xl shadow-strong p-4 z-[99999] w-56 mode-menu"
      style={{ animation: "modeFadeIn 0.18s ease-out" }}
    >
      {/* 閉じる */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 text-xl"
      >
        ×
      </button>

      <div className="space-y-3 mt-6">

        {/* メインマップ（防犯モード） */}
        <button
          onClick={() => {
            router.push("/");
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg shadow-soft bg-white"
        >
          <span className="text-2xl">🗺️</span>
          <span className="font-bold text-gray-800">防犯マップ</span>
        </button>

        {/* 災害モード */}
        <button
          onClick={() => {
            router.push("/rescue");
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg shadow-soft bg-white"
        >
          <span className="text-2xl">🟥</span>
          <span className="font-bold text-gray-800">災害モード</span>
        </button>

        {/* 高齢者見守り */}
        <button
          onClick={() => {
            router.push("/rescue/elderly");
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg shadow-soft bg-white"
        >
          <span className="text-2xl">🧡</span>
          <span className="font-bold text-gray-800">高齢者見守り</span>
        </button>

        {/* ナビモード */}
        <button
          onClick={() => {
            router.push("/navigation");
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg shadow-soft bg-white"
        >
          <span className="text-2xl">🧭</span>
          <span className="font-bold text-gray-800">ナビモード</span>
        </button>

        {/* 設定 */}
        <button
          onClick={() => {
            router.push("/settings");
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg shadow-soft bg-white"
        >
          <span className="text-2xl">⚙️</span>
          <span className="font-bold text-gray-800">設定</span>
        </button>

        {/* ログアウト */}
        <button
          onClick={() => {
            router.push("/login");
            onClose();
          }}
          className="w-full flex items-center gap-3 p-3 rounded-lg shadow-soft bg-white text-red-600"
        >
          <span className="text-2xl">🚪</span>
          <span className="font-bold">ログアウト</span>
        </button>

      </div>
    </div>
  );
}
