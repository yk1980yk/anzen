"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

const levelColors = {
  1: "border-blue-300 bg-blue-50",
  2: "border-green-300 bg-green-50",
  3: "border-yellow-300 bg-yellow-50",
  4: "border-orange-300 bg-orange-50",
  5: "border-red-300 bg-red-50",
};

export default function DangerAreasDashboard() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      const { data } = await supabase
        .from("danger_areas")
        .select("*")
        .order("created_at", { ascending: false });

      setAreas(data || []);
      setLoading(false);
    };

    fetchAreas();
  }, []);

  if (loading) return <p className="p-6">読み込み中...</p>;

  return (
    <div className="p-6 space-y-6 pb-20">

      <h1 className="text-2xl font-bold">危険エリア一覧（管理者）</h1>

      {areas.length === 0 && (
        <p className="text-gray-600">投稿がありません。</p>
      )}

      <div className="space-y-4">
        {areas.map((area) => (
          <div
            key={area.id}
            className={`border p-4 rounded shadow-sm ${levelColors[area.level]}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{area.title}</p>
                <p className="text-sm text-gray-700">{area.description}</p>

                <p className="text-sm mt-2">
                  レベル: {area.level} / 範囲: {area.radius}m
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  投稿日時: {new Date(area.created_at).toLocaleString()}
                </p>

                {area.display_time && (
                  <p className="text-xs text-gray-500">
                    表示時刻: {new Date(area.display_time).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 text-right">

                <Link
                  href={`/dashboard/danger-areas/${area.id}`}
                  className="text-blue-600 underline"
                >
                  詳細
                </Link>

                <Link
                  href={`/dashboard/danger-areas/${area.id}/edit`}
                  className="text-green-600 underline"
                >
                  編集
                </Link>

              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
