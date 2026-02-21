"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

// MapView（管理者用）
const MapView = dynamic(() => import("../../MapView"), { ssr: false });

export default function EditDangerAreaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [radius, setRadius] = useState(100);
  const [level, setLevel] = useState(1);
  const [error, setError] = useState("");

  // 初期データ読み込み
  useEffect(() => {
    const fetchArea = async () => {
      const { data, error } = await supabase
        .from("danger_areas")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setArea(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setRadius(data.radius);
        setLevel(data.level);
      }

      setLoading(false);
    };

    fetchArea();
  }, [id]);

  // 保存処理
  const handleSave = async () => {
    setError("");

    if (!title.trim()) {
      setError("タイトルは必須です");
      return;
    }

    const { error } = await supabase
      .from("danger_areas")
      .update({
        title,
        description,
        latitude,
        longitude,
        radius,
        level,
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
    } else {
      router.push(`/dashboard/danger-areas/${id}`);
    }
  };

  if (loading) return <p className="p-6">読み込み中...</p>;
  if (!area) return <p className="p-6">投稿が見つかりません。</p>;

  return (
    <div className="p-6 space-y-6 pb-20">

      <h1 className="text-2xl font-bold">危険エリアを編集</h1>

      <div className="anzen-card">
        <div className="flex flex-col md:flex-row gap-6">

          {/* 地図 */}
          <div className="w-full md:w-1/2">
            <MapView
              latitude={latitude}
              longitude={longitude}
              radius={radius}
              level={level}
              onMapClick={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              onRadiusChange={(r) => setRadius(r)}
              onCenterDrag={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
          </div>

          {/* フォーム */}
          <div className="flex-1 space-y-4">

            <input
              type="text"
              placeholder="タイトル（必須）"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border px-4 py-2 rounded-soft shadow-soft"
            />

            <textarea
              placeholder="説明（任意）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border px-4 py-2 rounded-soft shadow-soft"
            />

            <input
              type="number"
              placeholder="緯度"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className="w-full border px-4 py-2 rounded-soft shadow-soft"
            />

            <input
              type="number"
              placeholder="経度"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className="w-full border px-4 py-2 rounded-soft shadow-soft"
            />

            <input
              type="number"
              placeholder="範囲（メートル）"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full border px-4 py-2 rounded-soft shadow-soft"
            />

            <select
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value))}
              className="w-full border px-4 py-2 rounded-soft shadow-soft"
            >
              <option value={1}>レベル 1（低）</option>
              <option value={2}>レベル 2</option>
              <option value={3}>レベル 3</option>
              <option value={4}>レベル 4</option>
              <option value={5}>レベル 5（最高）</option>
            </select>

            {error && <p className="text-red-600">{error}</p>}

            <button onClick={handleSave} className="anzen-btn-primary">
              保存する
            </button>

          </div>

        </div>
      </div>

      <button
        onClick={() => router.push(`/dashboard/danger-areas/${id}`)}
        className="text-blue-600 underline block text-center mt-4"
      >
        詳細に戻る
      </button>

    </div>
  );
}
