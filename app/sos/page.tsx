"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function SosHome() {
  const router = useRouter();

  // ★ ANZEN ブランドの丸アイコンボタン
  const ModeButton = ({
    icon,
    active,
    onClick,
  }: {
    icon: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`w-12 h-12 flex items-center justify-center rounded-full shadow-md transition-transform hover:scale-105 ${
        active ? "bg-blue-500 text-white" : "bg-white text-gray-700"
      }`}
      style={{
        border: active ? "3px solid #1E90FF" : "2px solid #ccc",
      }}
    >
      <span className="text-xl">{icon}</span>
    </button>
  );

  return (
    <div className="relative min-h-screen bg-gray-100 p-6 pt-20 flex flex-col items-center">
      {/* ★ 共通ヘッダー */}
      <Header title="遭難モード" />

      {/* ★ 左上のモード切り替えアイコン */}
      <div className="absolute top-20 left-4 flex space-x-3 z-50">
        <ModeButton
          icon="🗺"
          active={true} // 今は遭難モード
          onClick={() => router.push("/sos")}
        />
        <ModeButton
          icon="👴"
          active={false}
          onClick={() => router.push("/rescue")}
        />
      </div>

      {/* タイトル（ヘッダーがあるので非表示でもOKだが残す） */}
      <h1 className="text-2xl font-bold mb-6 mt-6">🗺 遭難モード</h1>

      {/* ナビ開始ボタン（ANZENブルーに統一） */}
      <button
        onClick={() => router.push("/sos/navigation")}
        className="w-64 h-64 rounded-full shadow-xl text-white text-3xl font-bold flex items-center justify-center transition-transform hover:scale-105"
        style={{ backgroundColor: "#1E90FF" }}
      >
        ナビ開始
      </button>

      {/* 下のSOSボタン（赤のまま） */}
      <button
        onClick={() => alert("遭難SOSを送信しました（仮）")}
        className="mt-10 w-full p-5 rounded-lg shadow bg-red-500 text-white font-semibold text-lg"
      >
        🚨 SOS送信（後で実装）
      </button>
    </div>
  );
}
