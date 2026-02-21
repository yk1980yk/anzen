"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

// 地図本体（Leaflet）
const PublicMap = dynamic(() => import("../map/publicMap"), { ssr: false });

export default function UserMapPage() {
  const [mode, setMode] = useState<"crime" | "rescue" | "sos">("crime");
  const [menuOpen, setMenuOpen] = useState(false);

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ★ Supabase から危険エリアを取得
  useEffect(() => {
    const fetchAreas = async () => {
      const { data, error } = await supabase.from("danger_areas").select("*");
      if (!error) setAreas(data);
      setLoading(false);
    };
    fetchAreas();
  }, []);

  const modeIcon = {
    crime: "🛡",
    rescue: "🚨",
    sos: "🗺",
  };

  if (loading) return <p className="p-8">読み込み中...</p>;

  return (
    <div className="relative w-full h-screen">

      {/* モード切り替えボタン（左上） */}
      <div className="absolute top-4 left-4 z-[9999]">

        {/* ANZEN グラデーションの丸ボタン */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="
            w-14 h-14 rounded-full flex items-center justify-center text-3xl
            mode-icon active:scale-95
          "
        >
          {modeIcon[mode]}
        </button>

        {/* モードメニュー */}
        {menuOpen && (
          <div className="mt-3 bg-white rounded-xl shadow-strong p-3 space-y-2 w-44 mode-menu">
            <button
              onClick={() => {
                setMode("crime");
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100"
            >
              <span className="text-xl">🛡</span>
              <span className="text-sm font-medium">防犯モード</span>
            </button>

            <button
              onClick={() => {
                setMode("rescue");
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100"
            >
              <span className="text-xl">🚨</span>
              <span className="text-sm font-medium">救助要請モード</span>
            </button>

            <button
              onClick={() => {
                setMode("sos");
                setMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100"
            >
              <span className="text-xl">🗺</span>
              <span className="text-sm font-medium">遭難モード</span>
            </button>
          </div>
        )}
      </div>

      {/* 地図本体 */}
      <div className="absolute inset-0">
        <PublicMap areas={areas} selectedArea={null} />
      </div>

      {/* 左下：SOSボタン（脈動アニメーション付き） */}
      <button
        className="
          absolute bottom-24 left-4 z-[9999]
          w-20 h-20 rounded-full
          bg-red-600 text-white font-bold text-xl
          flex items-center justify-center
          shadow-xl sos-button
          active:scale-95 active:brightness-110
        "
      >
        SOS
      </button>

      {/* 下部メニュー（ANZEN Blue グラデーション） */}
      <div
        className="
          absolute bottom-0 left-0 w-full h-20
          anzen-gradient backdrop-blur-md
          flex justify-around items-center
          shadow-strong z-[9999]
        "
      >

        {/* 投稿 */}
        <a href="/report" className="flex flex-col items-center text-white active:scale-95">
          <span className="text-2xl">＋</span>
          <span className="text-xs mt-1">投稿</span>
        </a>

        {/* 設定 */}
        <a href="/settings" className="flex flex-col items-center text-white active:scale-95">
          <span className="text-2xl">⚙</span>
          <span className="text-xs mt-1">設定</span>
        </a>

        {/* マイページ */}
        <a href="/mypage" className="flex flex-col items-center text-white active:scale-95">
          <span className="text-2xl">👤</span>
          <span className="text-xs mt-1">マイページ</span>
        </a>

      </div>

    </div>
  );
}
