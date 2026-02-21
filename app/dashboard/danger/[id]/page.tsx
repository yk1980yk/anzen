"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type DangerArea = {
  id: string;
  title: string;
  description: string;
  level: number;
  latitude: number;
  longitude: number;
  created_at: string;
};

export default function DangerDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [area, setArea] = useState<DangerArea | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArea = async () => {
      const { data, error } = await supabase
        .from("danger_areas")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setArea(data);
      }
      setLoading(false);
    };

    fetchArea();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("本当に削除しますか？");
    if (!confirmDelete) return;

    await supabase.from("danger_areas").delete().eq("id", id);

    router.push("/dashboard/danger");
  };

  if (loading) return <p className="px-6 py-8">読み込み中...</p>;
  if (!area) return <p className="px-6 py-8">データが見つかりません。</p>;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 max-w-2xl mx-auto space-y-6">

      {/* タイトル */}
      <h1 className="text-2xl font-bold">危険エリア詳細</h1>

      {/* カード */}
      <div className="border rounded-soft p-5 bg-white shadow-soft space-y-4">

        <h2 className="text-xl font-semibold">{area.title}</h2>

        <p className="text-gray-700 leading-relaxed">{area.description}</p>

        <div className="text-sm text-gray-600 space-y-1">
          <p>危険度: {area.level}</p>
          <p>緯度: {area.latitude}</p>
          <p>経度: {area.longitude}</p>
          <p>作成日時: {new Date(area.created_at).toLocaleString()}</p>
        </div>

        {/* ボタン */}
        <div className="flex gap-3 pt-2">
          <Link
            href={`/dashboard/danger/${area.id}/edit`}
            className="bg-green-600 text-white px-4 py-3 rounded-soft shadow-soft hover:bg-green-700 transition font-semibold"
          >
            編集
          </Link>

          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-3 rounded-soft shadow-soft hover:bg-red-700 transition font-semibold"
          >
            削除
          </button>

          <Link
            href="/dashboard/danger"
            className="bg-gray-500 text-white px-4 py-3 rounded-soft shadow-soft hover:bg-gray-600 transition font-semibold"
          >
            戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
