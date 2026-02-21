"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";

// MiniMap（管理者用）
const MiniMap = dynamic(() => import("../MiniMap"), { ssr: false });

const levelColors = {
  1: "bg-blue-100 text-blue-700 border-blue-300",
  2: "bg-green-100 text-green-700 border-green-300",
  3: "bg-yellow-100 text-yellow-700 border-yellow-300",
  4: "bg-orange-100 text-orange-700 border-orange-300",
  5: "bg-red-100 text-red-700 border-red-300",
};

export default function DangerAreaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArea = async () => {
      const { data, error } = await supabase
        .from("danger_areas")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setArea(data);
      setLoading(false);
    };

    fetchArea();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("本当に削除しますか？")) return;

    await supabase.from("danger_areas").delete().eq("id", id);
    router.push("/dashboard/danger-areas");
  };

  if (loading) return <p className="p-8">読み込み中...</p>;
  if (!area) return <p className="p-8">投稿が見つかりません。</p>;

  return (
    <div className="p-6 space-y-6 pb-20">

      {/* 戻る */}
      <Link href="/dashboard/danger-areas" className="text-blue-600 underline">
        ← 一覧に戻る
      </Link>

      {/* タイトル */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{area.title}</h1>
        <span className="px-2 py-1 text-xs font-bold bg-white border rounded">
          レベル {area.level}
        </span>
      </div>

      {/* カード */}
      <div className={`anzen-card border ${levelColors[area.level]}`}>
        <div className="flex flex-col md:flex-row gap-6">

          {/* MiniMap */}
          <div className="w-full md:w-1/2">
            <MiniMap
              latitude={area.latitude}
              longitude={area.longitude}
              radius={area.radius}
              level={area.level}
            />
          </div>

          {/* 情報 */}
          <div className="flex-1 space-y-3">
            <p className="text-gray-700">{area.description}</p>

            <div className="text-sm space-y-1">
              <p>緯度: {area.latitude}</p>
              <p>経度: {area.longitude}</p>
              <p>範囲: {area.radius}m</p>
              <p>レベル: {area.level}</p>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <p>投稿日時: {new Date(area.created_at).toLocaleString()}</p>

              {area.display_time && (
                <p>表示時刻: {new Date(area.display_time).toLocaleString()}</p>
              )}
            </div>

            {/* ボタン */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() =>
                  router.push(`/dashboard/danger-areas/${area.id}/edit`)
                }
                className="anzen-btn-primary"
              >
                編集する
              </button>

              <button onClick={handleDelete} className="anzen-btn-danger">
                削除する
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
