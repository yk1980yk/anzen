"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getLocation } from "@/app/utils/getLocation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";

export default function DisasterSOS() {
  const router = useRouter();

  const [isFlashing, setIsFlashing] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  // アラーム音
  const alarmSound =
    typeof Audio !== "undefined" ? new Audio("/alarm.mp3") : null;

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
        active ? "bg-red-500 text-white" : "bg-white text-gray-700"
      }`}
      style={{
        border: active ? "3px solid #FF4D4D" : "2px solid #ccc",
      }}
    >
      <span className="text-xl">{icon}</span>
    </button>
  );

  // SOS送信
  const handleSOS = async () => {
    try {
      const loc = await getLocation();

      const { error } = await supabase.from("sos_logs").insert({
        mode: "disaster",
        lat: loc.lat,
        lng: loc.lng,
      });

      if (error) {
        alert("Supabase 送信エラー: " + error.message);
        return;
      }

      alert(`災害SOS送信完了！\n緯度: ${loc.lat}\n経度: ${loc.lng}`);
    } catch (err) {
      alert(err);
    }
  };

  // ライト点滅
  const toggleFlash = () => {
    setIsFlashing(!isFlashing);
  };

  // アラーム
  const toggleAlarm = () => {
    if (!alarmSound) return;

    if (isAlarmPlaying) {
      alarmSound.pause();
      alarmSound.currentTime = 0;
      setIsAlarmPlaying(false);
    } else {
      alarmSound.loop = true;
      alarmSound.play();
      setIsAlarmPlaying(true);
    }
  };

  return (
    <div
      className={`relative min-h-screen p-6 pt-20 flex flex-col items-center ${
        isFlashing ? "flash" : "bg-gray-100"
      }`}
    >
      {/* ★ 共通ヘッダー */}
      <Header title="災害SOS" />

      {/* ★ 左上のモード切り替え */}
      <div className="absolute top-20 left-4 flex space-x-3 z-50">
        <ModeButton
          icon="🔥"
          active={true}
          onClick={() => router.push("/rescue/disaster")}
        />
        <ModeButton
          icon="👵"
          active={false}
          onClick={() => router.push("/rescue/elderly")}
        />
      </div>

      {/* 大きなSOSボタン */}
      <button
        onClick={handleSOS}
        className="w-64 h-64 rounded-full shadow-xl text-white text-4xl font-bold flex items-center justify-center transition-transform hover:scale-105 mt-6"
        style={{ backgroundColor: "#FF4D4D" }}
      >
        SOS
      </button>

      {/* 下の操作ボタン */}
      <div className="mt-10 w-full flex flex-col gap-4">

        {/* 電話 */}
        <button
          onClick={() => {
            window.location.href = "tel:110";
          }}
          className="w-full p-4 rounded-lg shadow bg-white text-gray-700 font-semibold"
        >
          📞 コールセンターに電話
        </button>

        {/* ライト点滅 */}
        <button
          onClick={toggleFlash}
          className="w-full p-4 rounded-lg shadow bg-white text-gray-700 font-semibold"
        >
          🔦 ライト点滅 {isFlashing ? "（停止）" : "（開始）"}
        </button>

        {/* アラーム */}
        <button
          onClick={toggleAlarm}
          className="w-full p-4 rounded-lg shadow bg-white text-gray-700 font-semibold"
        >
          🔊 アラーム {isAlarmPlaying ? "（停止）" : "（開始）"}
        </button>

        {/* 位置情報送信（後で実装） */}
        <button className="w-full p-4 rounded-lg shadow bg-white text-gray-700 font-semibold">
          📍 位置情報送信（後で実装）
        </button>
      </div>
    </div>
  );
}
