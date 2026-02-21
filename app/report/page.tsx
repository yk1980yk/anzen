"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ReportPage() {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState(1);
  const [description, setDescription] = useState("");
  const [radius, setRadius] = useState(50);

  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // ★ 設定画面の値を読み込む
  const [settings, setSettings] = useState<any>(null);

  // 投稿画面の選択状態
  const [offsetMode, setOffsetMode] = useState<"exact" | "offset">("exact");
  const [delayMinutes, setDelayMinutes] = useState(0);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // ★ 初期読み込み（設定 + 現在地）
  useEffect(() => {
    // 設定読み込み
    const saved = localStorage.getItem("anzen-settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);

      // 投稿画面の初期値に反映
      setOffsetMode(parsed.defaultOffset || "exact");
      setDelayMinutes(parsed.defaultDelay || 0);
    }

    // 現在地取得
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => alert("位置情報が取得できませんでした")
    );
  }, []);

  const handleSubmit = async () => {
    if (!location) return alert("位置情報がまだ取得できていません");

    setLoading(true);

    let { latitude, longitude } = location;

    // ★ 位置をずらす（±30m）
    if (offsetMode === "offset") {
      const offset = (Math.random() - 0.5) * 0.0003; // 約30m
      latitude += offset;
      longitude += offset;
    }

    // ★ 表示時刻をずらす
    const display_time = new Date(Date.now() + delayMinutes * 60000).toISOString();

    const { error } = await supabase.from("danger_areas").insert({
      title,
      description,
      level,
      radius,
      latitude,
      longitude,
      display_time,
    });

    setLoading(false);

    if (error) {
      alert("投稿に失敗しました");
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold mb-4">投稿が完了しました</h1>
        <a href="/user-map" className="text-blue-600 underline">
          地図に戻る
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold mb-4">危険エリアを報告</h1>

      {/* タイトル */}
      <div className="anzen-card">
        <label className="font-semibold">タイトル</label>
        <input
          className="w-full mt-1 p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: 不審者を見かけた"
        />
      </div>

      {/* レベル */}
      <div className="anzen-card">
        <label className="font-semibold">危険レベル</label>
        <select
          className="w-full mt-1 p-2 border rounded"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        >
          <option value={1}>レベル1（注意）</option>
          <option value={2}>レベル2（警告）</option>
          <option value={3}>レベル3（危険）</option>
        </select>
      </div>

      {/* 説明 */}
      <div className="anzen-card">
        <label className="font-semibold">説明</label>
        <textarea
          className="w-full mt-1 p-2 border rounded"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="状況を詳しく入力してください"
        />
      </div>

      {/* 半径 */}
      <div className="anzen-card">
        <label className="font-semibold">危険範囲（m）</label>
        <input
          type="number"
          className="w-full mt-1 p-2 border rounded"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        />
      </div>

      {/* ★ 位置ずらし */}
      <div className="anzen-card">
        <label className="font-semibold">位置の精度</label>
        <div className="mt-2 space-y-1">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={offsetMode === "exact"}
              onChange={() => setOffsetMode("exact")}
            />
            正確に投稿する
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={offsetMode === "offset"}
              onChange={() => setOffsetMode("offset")}
            />
            少しずらして投稿する（約30m）
          </label>
        </div>
      </div>

      {/* ★ 時間ずらし */}
      <div className="anzen-card">
        <label className="font-semibold">投稿時刻</label>
        <div className="mt-2 space-y-1">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={delayMinutes === 0}
              onChange={() => setDelayMinutes(0)}
            />
            即時表示
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={delayMinutes === 5}
              onChange={() => setDelayMinutes(5)}
            />
            5分後に表示
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={delayMinutes === 10}
              onChange={() => setDelayMinutes(10)}
            />
            10分後に表示
          </label>
        </div>
      </div>

      {/* 投稿ボタン */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="
          w-full py-3 rounded-lg text-white font-bold
          anzen-gradient shadow-strong active:scale-95
        "
      >
        {loading ? "投稿中..." : "投稿する"}
      </button>
    </div>
  );
}
