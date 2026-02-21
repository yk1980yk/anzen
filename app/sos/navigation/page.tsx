"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLocation } from "@/utils/getLocation";
import Header from "@/components/Header";

export default function SosNavigation() {
  const router = useRouter();

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [distance, setDistance] = useState<number | null>(null);
  const [direction, setDirection] = useState<string>("北");

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

  // 現在地取得
  const fetchLocation = async () => {
    try {
      const loc = await getLocation();
      setLocation(loc);

      // 仮の距離・方向（後で本物の計算に差し替え）
      setDistance(120);
      setDirection("北東");
    } catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-100 p-6 pt-20 flex flex-col items-center">

      {/* ★ 共通ヘッダー */}
      <Header title="遭難ナビ" />

      {/* ★ 左上のモード切り替え */}
      <div className="absolute top-20 left-4 flex space-x-3 z-50">
        <ModeButton
          icon="🗺"
          active={true}
          onClick={() => router.push("/sos")}
        />
        <ModeButton
          icon="👴"
          active={false}
          onClick={() => router.push("/rescue")}
        />
      </div>

      {/* 現在地ボタン */}
      <button
        onClick={fetchLocation}
        className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-blue-500 text-xl transition-transform hover:scale-105 mt-6"
        style={{ border: "2px solid #1E90FF" }}
      >
        📍
      </button>

      {/* ナビ情報カード */}
      <div className="mt-6 w-full bg-white p-5 rounded-xl shadow-md text-center">
        <p className="text-gray-700 text-lg font-semibold">
          目的地までの距離
        </p>
        <p className="text-3xl font-bold mt-2">
          {distance ? `${distance} m` : "取得中..."}
        </p>

        <p className="text-gray-700 text-lg font-semibold mt-4">方向</p>
        <p className="text-3xl font-bold mt-2">{direction}</p>
      </div>

      {/* 下のSOSボタン */}
      <button
        onClick={() => alert("遭難SOSを送信しました（仮）")}
        className="mt-10 w-full p-5 rounded-lg shadow bg-red-500 text-white font-semibold text-lg"
      >
        🚨 SOS送信（後で実装）
      </button>
    </div>
  );
}
