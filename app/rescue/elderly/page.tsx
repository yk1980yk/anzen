"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getLocation } from "@/utils/getLocation";
import Header from "@/components/Header";

export default function ElderlySOS() {
  const [holding, setHolding] = useState(false);
  const [sent, setSent] = useState(false);
  const [safeSent, setSafeSent] = useState(false);

  // ★ 転倒検知
  const [fallDetect, setFallDetect] = useState(false);
  const [fallDialog, setFallDialog] = useState(false);

  const holdTimer = useRef<NodeJS.Timeout | null>(null);

  /* ============================================
     ★ 助けて（SOS）送信
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

      await supabase.from("elderly_sos").insert({
        user_id: user.id,
        lat: loc.lat,
        lng: loc.lng,
      });

      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      alert(err);
    }
  };

  /* ============================================
     ★ 長押し開始（2秒）
  ============================================ */
  const startHold = () => {
    setHolding(true);

    holdTimer.current = setTimeout(() => {
      sendSOS();
      setHolding(false);
    }, 2000);
  };

  /* ============================================
     ★ 長押しキャンセル
  ============================================ */
  const cancelHold = () => {
    setHolding(false);
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  /* ============================================
     ★ 元気です（安否チェック）
  ============================================ */
  const sendSafe = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase.from("elderly_safe").insert({
        user_id: user.id,
        created_at: new Date().toISOString(),
      });

      setSafeSent(true);
      setTimeout(() => setSafeSent(false), 2500);
    } catch (err) {
      alert(err);
    }
  };

  /* ============================================
     ★ 転倒通知送信
  ============================================ */
  const sendFallAlert = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("elderly_fall").insert({
      user_id: user.id,
      created_at: new Date().toISOString(),
    });

    setFallDialog(false);
  };

  /* ============================================
     ★ 転倒検知（疑似）
  ============================================ */
  useEffect(() => {
    if (!fallDetect) return;

    let lastAccel = { x: 0, y: 0, z: 0 };
    let lastTime = Date.now();

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const now = Date.now();
      const diff = now - lastTime;

      if (diff < 200) return;
      lastTime = now;

      const dx = Math.abs(acc.x - lastAccel.x);
      const dy = Math.abs(acc.y - lastAccel.y);
      const dz = Math.abs(acc.z - lastAccel.z);

      const magnitude = dx + dy + dz;

      // 高齢者向けに優しめの閾値
      if (magnitude > 22) {
        setFallDialog(true);
      }

      lastAccel = { x: acc.x, y: acc.y, z: acc.z };
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [fallDetect]);

  return (
    <div className="relative min-h-screen bg-[#FFF8E8] p-6 pt-20 flex flex-col items-center">
      <Header title="高齢者見守り" />

      {/* ★ 助けて送信完了ポップアップ */}
      {sent && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: "20px 26px",
            borderRadius: "14px",
            color: "#D35400",
            fontSize: "20px",
            fontWeight: "bold",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            zIndex: 9999,
            textAlign: "center",
          }}
        >
          🧡 家族に通知しました
          <div style={{ fontSize: "14px", marginTop: "6px", color: "#555" }}>
            しばらくその場でお待ちください
          </div>
        </div>
      )}

      {/* ★ 元気ですポップアップ */}
      {safeSent && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: "20px 26px",
            borderRadius: "14px",
            color: "#27AE60",
            fontSize: "20px",
            fontWeight: "bold",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            zIndex: 9999,
            textAlign: "center",
          }}
        >
          🟢 元気です を送信しました
        </div>
      )}

      {/* ★ 転倒確認ダイアログ */}
      {fallDialog && (
        <div
          style={{
            position: "fixed",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            padding: "24px 28px",
            borderRadius: "14px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            zIndex: 9999,
            textAlign: "center",
            width: "85%",
            maxWidth: "360px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "10px",
              color: "#E67E22",
            }}
          >
            転倒しましたか？
          </div>

          <div style={{ fontSize: "14px", color: "#555", marginBottom: "20px" }}>
            家族に知らせることができます
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={sendFallAlert}
              style={{
                padding: "10px 16px",
                background: "#E67E22",
                color: "white",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              はい、通知する
            </button>

            <button
              onClick={() => setFallDialog(false)}
              style={{
                padding: "10px 16px",
                background: "#ddd",
                color: "#333",
                borderRadius: "8px",
                fontWeight: "bold",
              }}
            >
              いいえ
            </button>
          </div>
        </div>
      )}

      {/* ★ 大きな助けてボタン */}
      <div
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        className={holding ? "sos-hold" : ""}
        style={{
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #F5A623, #F76B1C)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "42px",
          fontWeight: "bold",
          color: "white",
          boxShadow: "0 0 20px rgba(247,107,28,0.5)",
          userSelect: "none",
          touchAction: "none",
          marginTop: "40px",
        }}
      >
        助けて
      </div>

      <p className="mt-4 text-gray-700 font-semibold text-lg">
        長押しで家族に通知します
      </p>

      {/* 下の操作ボタン */}
      <div className="mt-10 w-full flex flex-col gap-4">
        {/* 元気です */}
        <button
          onClick={sendSafe}
          className="w-full p-4 rounded-lg shadow bg-white text-gray-700 font-semibold text-lg"
        >
          🟢 元気です（安否チェック）
        </button>

        {/* 転倒検知 */}
        <button
          onClick={() => setFallDetect(!fallDetect)}
          className="w-full p-4 rounded-lg shadow bg-white text-gray-700 font-semibold text-lg"
        >
          ⚠️ 転倒検知 {fallDetect ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}
