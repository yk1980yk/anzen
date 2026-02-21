"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DangerNewPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [radius, setRadius] = useState(100);
  const [level, setLevel] = useState(1);
  const [type, setType] = useState("fire");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");

  const [loading, setLoading] = useState(false);

  // 通知バナー
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerType, setBannerType] = useState<"success" | "error">("success");

  const showNotification = (message: string, type: "success" | "error") => {
    setBannerMessage(message);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (latitude === "" || longitude === "") {
      showNotification("緯度・経度を入力してください", "error");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("danger_areas").insert({
      title,
      description,
      radius,
      level,
      type,
      latitude,
      longitude,
    });

    setLoading(false);

    if (error) {
      showNotification("作成に失敗しました: " + error.message, "error");
    } else {
      showNotification("危険エリアを作成しました", "success");
      setTimeout(() => router.push("/dashboard/danger"), 800);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 max-w-xl mx-auto space-y-6">

      {/* 通知バナー */}
      {showBanner && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-soft shadow-strong text-white z-[9999] ${
            bannerType === "success" ? "bg-blue-600" : "bg-red-600"
          }`}
        >
          {bannerMessage}
        </div>
      )}

      <h1 className="text-2xl font-bold">危険エリア新規追加</h1>

      <form onSubmit={handleCreate} className="bg-white p-5 rounded-soft shadow-soft space-y-5">

        <div>
          <label className="block mb-1 font-medium">タイトル</label>
          <input
            className="w-full border rounded-soft px-4 py-3 shadow-soft"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">説明</label>
          <textarea
            className="w-full border rounded-soft px-4 py-3 shadow-soft"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">種類</label>
          <select
            className="w-full border rounded-soft px-4 py-3 shadow-soft"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="fire">火災</option>
            <option value="crime">犯罪</option>
            <option value="elderly">高齢者徘徊</option>
            <option value="other">その他</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">危険レベル</label>
          <select
            className="w-full border rounded-soft px-4 py-3 shadow-soft"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
          >
            <option value={1}>1（軽度）</option>
            <option value={2}>2（注意）</option>
            <option value={3}>3（警戒）</option>
            <option value={4}>4（危険）</option>
            <option value={5}>5（最危険）</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">半径（m）</label>
          <input
            type="number"
            className="w-full border rounded-soft px-4 py-3 shadow-soft"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">緯度</label>
          <input
            type="number"
            className="w-full border rounded-soft px-4 py-3 shadow-soft"
            value={latitude}
            onChange={(e) => setLatitude(Number(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">経度</label>
          <input
            type="number"
            className="w-full border rounded-soft px-4 py-3 shadow-soft"
            value={longitude}
            onChange={(e) => setLongitude(Number(e.target.value))}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded-soft shadow-soft w-full hover:bg-blue-700 transition font-semibold"
        >
          {loading ? "作成中..." : "作成する"}
        </button>
      </form>
    </div>
  );
}
