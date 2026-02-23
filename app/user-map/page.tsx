"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// 地図（SSR 無効）
const PublicMap = dynamic(() => import("../map/publicMap"), { ssr: false });

export default function UserMapPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 危険エリア取得
  useEffect(() => {
    const fetchAreas = async () => {
      const { data, error } = await supabase.from("danger_areas").select("*");
      if (!error) setAreas(data);
      setLoading(false);
    };
    fetchAreas();
  }, []);

  if (loading) return <p className="p-8">読み込み中...</p>;

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* ★ 地図（背景） */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <PublicMap areas={areas} selectedArea={null} />
      </div>

      {/* ★ UI（ページ内に閉じ込める → 遷移時に消える） */}
      <div className="relative w-full h-full z-10 pointer-events-auto">

        {/* SOS */}
        <button
          className="absolute bottom-24 left-4 w-20 h-20 rounded-full bg-red-600 text-white font-bold text-xl flex items-center justify-center shadow-xl active:scale-95"
        >
          SOS
        </button>

        {/* 下部メニュー */}
        <div className="absolute bottom-0 left-0 w-full h-20 anzen-gradient backdrop-blur-md flex justify-around items-center shadow-strong">

          <button
            onClick={() => router.push("/report")}
            className="flex flex-col items-center text-white active:scale-95"
          >
            <span className="text-2xl">＋</span>
            <span className="text-xs mt-1">投稿</span>
          </button>

          <button
            onClick={() => router.push("/mypage")}
            className="flex flex-col items-center text-white active:scale-95"
          >
            <span className="text-2xl">👤</span>
            <span className="text-xs mt-1">マイページ</span>
          </button>

          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center text-white active:scale-95"
          >
            <span className="text-2xl">🎛</span>
            <span className="text-xs mt-1">モード</span>
          </button>

          <button
            onClick={() => router.push("/settings")}
            className="flex flex-col items-center text-white active:scale-95"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-xs mt-1">設定</span>
          </button>

        </div>
      </div>

      {/* ★ モード切替モーダル */}
      {menuOpen && (
        <div
          className="fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-2xl p-6 space-y-4 z-[999999]"
          style={{ animation: "slideUp 0.25s ease-out" }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-3 right-4 text-2xl"
          >
            ✕
          </button>

          <h2 className="text-lg font-bold mb-2">モード切替</h2>

          <button
            onClick={() => {
              setMenuOpen(false);
              router.push("/crime");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
          >
            <span className="text-2xl">🛡</span>
            <span className="text-base font-medium">防犯モード</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              router.push("/rescue/disaster");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
          >
            <span className="text-2xl">🚨</span>
            <span className="text-base font-medium">救助要請モード</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              router.push("/sos-scout");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
          >
            <span className="text-2xl">🗺</span>
            <span className="text-base font-medium">遭難モード</span>
          </button>

          <button
            onClick={() => {
              setMenuOpen(false);
              router.push("/rescue/elderly");
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100"
          >
            <span className="text-2xl">👵</span>
            <span className="text-base font-medium">高齢者見守り</span>
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
