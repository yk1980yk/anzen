"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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

export default function DangerListPage() {
  const [areas, setAreas] = useState<DangerArea[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchAreas = async () => {
    const { data, error } = await supabase
      .from("danger_areas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showNotification("データ取得に失敗しました", "error");
    } else if (data) {
      setAreas(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // 削除処理
  const handleDelete = async (id: string) => {
    const ok = window.confirm("本当に削除しますか？");
    if (!ok) return;

    const { error } = await supabase.from("danger_areas").delete().eq("id", id);

    if (error) {
      showNotification("削除に失敗しました: " + error.message, "error");
    } else {
      showNotification("削除しました", "success");
      fetchAreas();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 space-y-6">

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

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">危険エリア一覧</h1>

        <Link
          href="/dashboard/danger/new"
          className="bg-blue-600 text-white px-4 py-3 rounded-soft shadow-soft hover:bg-blue-700 transition font-semibold"
        >
          新規追加
        </Link>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : areas.length === 0 ? (
        <p className="text-gray-500">まだ危険エリアが登録されていません。</p>
      ) : (
        <div className="space-y-4">
          {areas.map((area) => (
            <div
              key={area.id}
              className="bg-white p-5 rounded-soft shadow-soft border border-gray-200"
            >
              <p className="text-lg font-bold">{area.title}</p>

              <p className="text-sm text-gray-600 mt-1">
                危険レベル: {area.level}
              </p>

              <p className="text-sm text-gray-600">
                半径: {area.radius}m / 種類: {area.type}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                作成日: {new Date(area.created_at).toLocaleString()}
              </p>

              <div className="flex gap-3 mt-4">
                <Link
                  href={`/dashboard/danger/${area.id}`}
                  className="bg-gray-500 text-white px-4 py-2 rounded-soft shadow-soft hover:bg-gray-600 transition text-sm font-semibold"
                >
                  詳細
                </Link>

                <Link
                  href={`/dashboard/danger/${area.id}/edit`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-soft shadow-soft hover:bg-blue-700 transition text-sm font-semibold"
                >
                  編集
                </Link>

                <button
                  onClick={() => handleDelete(area.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-soft shadow-soft hover:bg-red-700 transition text-sm font-semibold"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
