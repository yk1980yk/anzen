"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

// DangerArea 型を定義
type DangerArea = {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  level: 1 | 2 | 3 | 4 | 5;
  type: string;
  created_at: string;
};

// MapView（管理者用）
const MapView = dynamic(() => import("../MapView"), { ssr: false });

export default function DangerAreaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [area, setArea] = useState<DangerArea | null>(null); // ← 型を追加
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArea = async () => {
      const { data, error } = await supabase
        .from("danger_areas")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        setArea(data as DangerArea);
      }

      setLoading(false);
    };

    fetchArea();
  }, [id]);

  if (loading) return <p className="p-6">読み込み中...</p>;
  if (!area) return <p className="p-6">投稿が見つかりません。</p>;

  return (
    <div className="p-6 space-y-6 pb-20">

      {/* タイトル */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{area.title}</h1>
        <span className="px-2 py-1 text-xs font-bold bg-white border rounded">
          レベル {area.level}
        </span>
      </div>

      {/* 地図 */}
      <div className="w-full h-[300px] rounded-soft overflow-hidden shadow-soft">
        <MapView
          latitude={area.latitude}
          longitude={area.longitude}
          radius={area.radius}
          level={area.level}
        
        />
      </div>

      {/* 詳細 */}
      <div className="anzen-card space-y-3">
        <p className="text-gray-700">{area.description}</p>

        <p className="text-sm text-gray-600">
          緯度: {area.latitude} / 経度: {area.longitude}
        </p>

        <p className="text-sm text-gray-600">
          半径: {area.radius}m
        </p>

        <p className="text-sm text-gray-600">
          種類: {area.type}
        </p>

        <p className="text-xs text-gray-500">
          作成日: {new Date(area.created_at).toLocaleString()}
        </p>
      </div>

      <button
        onClick={() => router.push(`/dashboard/danger-areas/${id}/edit`)}
        className="anzen-btn-primary"
      >
        編集する
      </button>

    </div>
  );
}
