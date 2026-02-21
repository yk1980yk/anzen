"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type DangerArea = {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: string;
  level: number;
  created_at: string;
};

export default function DangerEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [area, setArea] = useState<DangerArea | null>(null);
  const [loading, setLoading] = useState(true);

  // 編集用
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [radius, setRadius] = useState(100);
  const [level, setLevel] = useState(1);
  const [type, setType] = useState("fire");

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

  // 初期データ取得
  useEffect(() => {
    const fetchArea = async () => {
      const { data, error } = await supabase
        .from("danger_areas")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setArea(data);
        setTitle(data.title);
        setDescription(data.description);
        setRadius(data.radius);
        setLevel(data.level);
        setType(data.type);
      }

      setLoading(false);
    };

    fetchArea();
  }, [id]);

  // 保存
  const handleSave = async () => {
    const { error } = await supabase
      .from("danger_areas")
      .update({
        title,
        description,
        radius,
        level,
        type,
      })
      .eq("id", id);

    if (error) {
      showNotification("更新に失敗しました: " + error.message, "error");
    } else {
      showNotification("更新しました", "success");
      setTimeout(() => router.push("/dashboard/danger"), 800);
    }
  };

  // 削除
  const handleDelete = async () => {
    const ok = window.confirm("本当に削除しますか？");
    if (!ok) return;

    const { error } = await supabase
      .from("danger_areas")
      .delete()
      .eq("id", id);

    if (error) {
      showNotification("削除に失敗しました: " + error.message, "error");
    } else {
      showNotification("削除しました", "success");
      setTimeout(() => router.push("/dashboard/danger"), 800);
    }
  };

  if (loading) return <p className="px-6 py-8">読み込み中...</p>;
  if (!area) return <p className="px-6 py-8">データが見つかりません。</p>;

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

      <h1 className="text-2xl font-bold">危険エリア編集</h1>

      <div className="bg-white p-5 rounded-soft shadow-soft space-y-5">

        <div>
          <label className="block mb-1 font-medium">タイトル</label>
          <input
            className="w-full border rounded-soft px-4 py-3 shadow-soft"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-3 rounded-soft shadow-soft hover:bg-blue-700 transition font-semibold"
          >
            保存
          </button>

          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-3 rounded-soft shadow-soft hover:bg-red-700 transition font-semibold"
          >
            削除
          </button>

          <button
            onClick={() => router.push("/dashboard/danger")}
            className="bg-gray-500 text-white px-4 py-3 rounded-soft shadow-soft hover:bg-gray-600 transition font-semibold"
          >
            戻る
          </button>
        </div>

      </div>
    </div>
  );
}
