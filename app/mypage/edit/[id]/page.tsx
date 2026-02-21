"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditMyDangerArea() {
  const { id } = useParams();
  const router = useRouter();

  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState(1);
  const [description, setDescription] = useState("");
  const [radius, setRadius] = useState(50);

  useEffect(() => {
    const fetchArea = async () => {
      const { data } = await supabase
        .from("danger_areas")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setArea(data);
        setTitle(data.title);
        setLevel(data.level);
        setDescription(data.description);
        setRadius(data.radius);
      }

      setLoading(false);
    };

    fetchArea();
  }, [id]);

  const handleSave = async () => {
    await supabase
      .from("danger_areas")
      .update({
        title,
        level,
        description,
        radius,
        updated_at: new Date(),
      })
      .eq("id", id);

    router.push("/mypage");
  };

  if (loading) return <p className="p-6">読み込み中...</p>;
  if (!area) return <p className="p-6">投稿が見つかりません。</p>;

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">投稿を編集</h1>

      {/* タイトル */}
      <div className="anzen-card">
        <label className="font-semibold">タイトル</label>
        <input
          className="w-full mt-1 p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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

      {/* 保存 */}
      <button
        onClick={handleSave}
        className="
          w-full py-3 rounded-lg text-white font-bold
          anzen-gradient shadow-strong active:scale-95
        "
      >
        保存する
      </button>

      {/* 戻る */}
      <button
        onClick={() => router.push("/mypage")}
        className="text-blue-600 underline block text-center mt-4"
      >
        マイページに戻る
      </button>
    </div>
  );
}
