"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import ModeSwitcher from "@/components/map/ModeSwitcher";

import MapRecenterButton from "@/components/ui/MapRecenterButton";


// メインの危険エリアマップ（投稿＋閲覧）
const MainMap = dynamic(() => import("./MainMap"), { ssr: false });

export default function Home() {
  const [showModes, setShowModes] = useState(false);

  return (
    <div className="relative" style={{ height: "100dvh" }}>

      {/* メインのマップ（危険エリア投稿＋閲覧） */}
      <MainMap />

      {/* 現在地ボタン */}
      <MapRecenterButton
        onClick={() => window.dispatchEvent(new Event("recenter-map"))}
      />

      {/* モード切替ボタン（左上） */}
      <button
        onClick={() => setShowModes(!showModes)}
        className="absolute top-4 left-4 bg-white rounded-xl shadow-soft p-3 text-2xl z-[9999]"
      >
        🛡
      </button>

      {/* モード切替メニュー */}
      {showModes && <ModeSwitcher onClose={() => setShowModes(false)} />}
    </div>
  );
}
