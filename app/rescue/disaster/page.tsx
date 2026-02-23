"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLocation } from "@/utils/getLocation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";

export default function DisasterSOS() {
  const router = useRouter();

  const [isFlashing, setIsFlashing] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  // ★ SOS送信後のUI
  const [sent, setSent] = useState(false);

  // 長押し判定
  const [holding, setHolding] = useState(false);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  // アラーム音
  const alarmSound =
    typeof Audio !== "undefined" ? new Audio("/alarm.mp3") : null;

  // 公開範囲の日本語ラベル
  const visibilityLabelMap: any = {
    all: "全ユーザー",
    nearby: "近くのユーザー",
    family_nearby: "家族＋近くのユーザー",
    family_only: "家族のみ",
  };

  const visibility =
    localStorage.getItem("disaster_visibility") || "family_nearby";

  const visibilityLabel = visibilityLabelMap[visibility];

  /* ============================================
     ★ SOS送信処理
  ============================================ */
  const sendSOS = async () => {
    try {
      const loc = await getLocation();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("ログインが必要です");
        return;
      }

      const { error } = await supabase.from("disaster_sos").insert({
        user_id: user.id,
        lat: loc.lat,
        lng: loc.lng,
        visibility,
      });

      if (error) {
        alert("Supabase 送信エラー: " + error.message);
        return;
      }

      // ★ 送信完了UI
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch (err) {
      alert(err);
    }
  };

  /* ============================================
     ★ 長押し開始
  ============================================ */
  const startHold = () => {
    setHolding(true);

    holdTimer.current = setTimeout(() => {
      sendSOS();
      setHolding(false);
    }, 1500); // ★ 長押し1.5秒
  };

  /* ============================================
     ★ 長押しキャンセル
  ============================================ */
  const cancelHold = () => {
    setHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  /* ============================================
     ★ ライト点滅
  ============================================ */
  const toggleFlash = () => {
    setIsFlashing(!isFlashing);
  };

  /* ============================================
     ★ アラーム
  ============================================ */
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
      <Header title="救助要請モード" />

      {/* ★ 送信完了バナー */}
      {sent && (
        <>
          <div
            className="notification-banner"
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "white",
              color: "red",
              padding: "12px 20px",
              borderRadius: "10px",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              zIndex: 9999,
              textAlign: "center",
            }}
          >
            <div>SOSを送信しました</div>
            <div style={{ fontSize: "12px", marginTop: "4px", color: "#444" }}>
              公開範囲：{visibilityLabel}
            </div>
          </div>

          {/* 白フラッシュ */}
          <div
            className="flash"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              pointerEvents: "none",
              zIndex: 9998,
            }}
          />
        </>
      )}

      {/* ★ 左上のモード切り替え */}
      <div className="absolute top-20 left-4 flex space-x-3 z-50">
        <button
          onClick={() => router.push("/rescue/disaster")}
          className="w-12 h-12 flex items-center justify-center rounded-full shadow-md bg-red-500 text-white border-[3px] border-red-400"
        >
          🔥
        </button>

        <button
          onClick={() => router.push("/rescue/elderly")}
          className="w-12 h-12 flex items-center justify-center rounded-full shadow-md bg-white text-gray-700 border-[2px] border-gray-300"
        >
          👵
        </button>
      </div>

      {/* ★ 長押しSOSボタン */}
      <div
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        className={holding ? "sos-hold" : ""}
        style={{
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "#FF4D4D",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "48px",
          fontWeight: "bold",
          color: "white",
          boxShadow: "0 0 20px rgba(255,0,0,0.6)",
          userSelect: "none",
          touchAction: "none",
          marginTop: "40px",
        }}
      >
        SOS
      </div>

      <p className="mt-4 text-gray-700 font-semibold">長押しでSOSを送信</p>

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
      </div>
    </div>
  );
}
