"use client";

import { useRouter } from "next/navigation";

export default function Header({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="w-full bg-white shadow-md py-4 px-4 flex items-center justify-between fixed top-0 left-0 z-50">
      {/* 戻るボタン */}
      <button
        onClick={() => router.back()}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow transition-transform hover:scale-105 text-blue-500"
        style={{ border: "2px solid #1E90FF" }}
      >
        ←
      </button>

      {/* タイトル */}
      <h1 className="text-lg font-bold">{title}</h1>

      {/* 右側のスペース（バランス用） */}
      <div className="w-10" />
    </div>
  );
}
