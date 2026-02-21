"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

// MiniMap（SSR無効）
const MiniMap = dynamic(() => import("./MiniMap"), { ssr: false });

// 一覧ページ用の地図（SSR無効）
const MapViewList = dynamic(() => import("@/components/MapViewList"), {
  ssr: false,
});

// 危険レベルの色（カード & バッジ共通）
const levelColors = {
  1: "bg-blue-100 text-blue-700 border-blue-300",
  2: "bg-green-100 text-green-700 border-green-300",
  3: "bg-yellow-100 text-yellow-700 border-yellow-300",
  4: "bg-orange-100 text-orange-700 border-orange-300",
  5: "bg-red-100 text-red-700 border-red-300",
};

export default function DangerAreasPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ★ 表示フィルタ（デフォルト：全部 ON）
  const [visibleLevels, setVisibleLevels] = useState([1, 2, 3, 4, 5]);

  const router = useRouter();

  // 一覧取得（group_id で絞る）
  const fetchAreas = async () => {
    const { data, error } = await supabase
      .from("danger_areas")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });

    if (!error) {
      setAreas(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAreas();
  }, [groupId]);

  if (loading) return <p className="p-8">読み込み中...</p>;

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold">危険エリア一覧</h1>

      {/* 地図（一覧表示用） */}
      <div className="w-full h-[400px] rounded overflow-hidden">
        <MapViewList dangerAreas={areas} visibleLevels={visibleLevels} />
      </div>

      {/* ★ 表示フィルタ（ユーザー向け） */}
      <div className="flex flex-wrap gap-3 mt-4">
        {[1, 2, 3, 4, 5].map((level) => (
          <label key={level} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={visibleLevels.includes(level)}
              onChange={() => {
                setVisibleLevels((prev) =>
                  prev.includes(level)
                    ? prev.filter((l) => l !== level)
                    : [...prev, level]
                );
              }}
            />
            <span>レベル {level}</span>
          </label>
        ))}
      </div>

      {/* 一覧 */}
      {areas.length === 0 ? (
        <p>該当する危険エリアがありません。</p>
      ) : (
        <ul className="space-y-6">
          {areas.map((area) => (
            <li
              key={area.id}
              className={`border rounded shadow-sm p-4 ${levelColors[area.level]}`}
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* ミニマップ */}
                <div className="w-full md:w-1/3">
                  <MiniMap
                    latitude={area.latitude}
                    longitude={area.longitude}
                    radius={area.radius}
                    level={area.level}
                  />
                </div>

                {/* 情報 */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2
                        className="text-xl font-bold underline cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/groups/${groupId}/danger-areas/${area.id}`
                          )
                        }
                      >
                        {area.title}
                      </h2>

                      {/* 危険レベルバッジ */}
                      <span className="px-2 py-1 text-xs font-bold bg-white border rounded">
                        レベル {area.level}
                      </span>
                    </div>

                    <p className="text-gray-700 mt-1">{area.description}</p>

                    <div className="mt-3 space-y-1 text-sm text-gray-800">
                      <p>緯度: {area.latitude}</p>
                      <p>経度: {area.longitude}</p>
                      <p>範囲: {area.radius}m</p>
                    </div>
                  </div>

                  <div className="flex gap-6 mt-4 md:mt-0">
                    <button
                      onClick={() =>
                        router.push(
                          `/groups/${groupId}/danger-areas/${area.id}/edit`
                        )
                      }
                      className="text-blue-700 font-semibold underline"
                    >
                      編集
                    </button>

                    <button
                      onClick={() => {
                        if (confirm("本当に削除しますか？")) {
                          supabase
                            .from("danger_areas")
                            .delete()
                            .eq("id", area.id)
                            .eq("group_id", groupId)
                            .then(() => fetchAreas());
                        }
                      }}
                      className="text-red-600 font-semibold underline"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 新規作成ボタン（固定） */}
      <button
        onClick={() =>
          router.push(`/groups/${groupId}/danger-areas/new`)
        }
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg"
      >
        ＋ 新規エリア
      </button>
    </div>
  );
}
