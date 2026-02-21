"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

// 型定義
type SosLog = {
  id: string;
  mode: string;
  lat: number;
  lng: number;
  created_at: string;
};

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

// 地図（SSR無効）
const AdminMap = dynamic(() => import("./components/AdminMap"), {
  ssr: false,
});

// 距離計算（ハバーサイン）
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function AdminSOS() {
  const [logs, setLogs] = useState<SosLog[]>([]);
  const [dangerAreas, setDangerAreas] = useState<DangerArea[]>([]);

  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("🔔 新しいSOSを受信しました");

  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);

  // 編集モーダル
  const [editingArea, setEditingArea] = useState<DangerArea | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLevel, setEditLevel] = useState(1);
  const [editRadius, setEditRadius] = useState(100);

  // 新規追加モーダル
  const [creating, setCreating] = useState(false);
  const [createLat, setCreateLat] = useState(0);
  const [createLng, setCreateLng] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState("fire");
  const [newLevel, setNewLevel] = useState(1);
  const [newRadius, setNewRadius] = useState(100);

  // データ取得
  const fetchLogs = async () => {
    const { data } = await supabase
      .from("sos_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setLogs(data);
  };

  const fetchDangerAreas = async () => {
    const { data } = await supabase
      .from("danger_areas")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setDangerAreas(data);
  };

  // 初期ロード + リアルタイム
  useEffect(() => {
    fetchLogs();
    fetchDangerAreas();

    // SOSリアルタイム
    const sosChannel = supabase
      .channel("sos-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sos_logs" },
        (payload) => {
          const newLog = payload.new as SosLog;
          setLogs((prev) => [newLog, ...prev]);

          const inside = dangerAreas.some((area) => {
            const dist = getDistance(
              newLog.lat,
              newLog.lng,
              area.latitude,
              area.longitude
            );
            return dist <= area.radius;
          });

          setBannerMessage(
            inside
              ? "🚨 危険エリア内でSOSが発生しました"
              : "🔔 新しいSOSを受信しました"
          );

          setShowBanner(true);
          setTimeout(() => setShowBanner(false), 3000);
        }
      )
      .subscribe();

    // 危険エリアリアルタイム
    const dangerChannel = supabase
      .channel("danger-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "danger_areas" },
        () => fetchDangerAreas()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sosChannel);
      supabase.removeChannel(dangerChannel);
    };
  }, [dangerAreas]);

  // マーカークリック
  const handleMarkerClick = (id: string) => {
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 2000);
  };

  // カードクリック → 地図フォーカス
  const handleCardClick = (log: SosLog) => {
    setFocus({ lat: log.lat, lng: log.lng });
  };

  // 危険エリア内判定
  const dangerInsideMap = logs.reduce((acc, log) => {
    const inside = dangerAreas.some((area) => {
      const dist = getDistance(
        log.lat,
        log.lng,
        area.latitude,
        area.longitude
      );
      return dist <= area.radius;
    });
    acc[log.id] = inside;
    return acc;
  }, {} as Record<string, boolean>);

  // 編集開始
  const openEditModal = (area: DangerArea) => {
    setEditingArea(area);
    setEditTitle(area.title);
    setEditDescription(area.description);
    setEditLevel(area.level);
    setEditRadius(area.radius);
  };

  // 編集保存
  const saveEdit = async () => {
    if (!editingArea) return;

    await supabase
      .from("danger_areas")
      .update({
        title: editTitle,
        description: editDescription,
        level: editLevel,
        radius: editRadius,
      })
      .eq("id", editingArea.id);

    setEditingArea(null);
  };

  // 新規追加開始
  const openCreateModal = (lat: number, lng: number) => {
    setCreateLat(lat);
    setCreateLng(lng);
    setCreating(true);
  };

  // 新規追加保存
  const saveCreate = async () => {
    await supabase.from("danger_areas").insert({
      title: newTitle,
      description: newDescription,
      type: newType,
      level: newLevel,
      radius: newRadius,
      latitude: createLat,
      longitude: createLng,
    });

    setCreating(false);
    setNewTitle("");
    setNewDescription("");
    setNewType("fire");
    setNewLevel(1);
    setNewRadius(100);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 relative space-y-6">

      {/* 通知バナー */}
      {showBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-soft shadow-strong z-[9999]">
          {bannerMessage}
        </div>
      )}

      <h1 className="text-3xl font-bold">📡 SOSリアルタイム監視</h1>

      {/* 地図 */}
      <div className="w-full h-[40vh] rounded-soft overflow-hidden shadow-strong bg-white">
        {logs.length > 0 ? (
          <AdminMap
            logs={logs}
            dangerAreas={dangerAreas}
            dangerInsideMap={dangerInsideMap}
            onMarkerClick={handleMarkerClick}
            onEditDangerArea={openEditModal}
            onCreateDangerArea={openCreateModal}
            focus={focus}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            まだSOSがありません
          </div>
        )}
      </div>

      {/* SOS一覧 */}
      <div className="flex flex-col gap-4">
        {logs.map((log) => {
          const inside = dangerInsideMap[log.id];

          return (
            <div
              key={log.id}
              onClick={() => handleCardClick(log)}
              className={`p-5 rounded-soft shadow-soft border cursor-pointer transition-all duration-300 ${
                highlightId === log.id ? "ring-4 ring-blue-400" : ""
              } ${
                inside
                  ? "bg-red-50 border-red-300"
                  : "bg-white border-gray-200"
              }`}
            >
              <p className="text-lg font-bold">
                🚨 種類：
                {log.mode === "disaster"
                  ? "災害SOS"
                  : log.mode === "elderly"
                  ? "高齢者SOS"
                  : "遭難SOS"}
              </p>

              <p>📍 緯度：{log.lat}</p>
              <p>📍 経度：{log.lng}</p>

              {inside && (
                <p className="text-red-600 font-bold mt-1">
                  ⚠ 危険エリア内で発生
                </p>
              )}

              <p className="text-sm text-gray-500 mt-1">
                🕒 {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* 新規追加モーダル */}
      {creating && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999]">
          <div className="bg-white p-6 rounded-soft shadow-strong w-[90%] max-w-md space-y-4">

            <h2 className="text-xl font-bold">危険エリアを追加</h2>

            <p className="text-sm text-gray-600">
              📍 クリック位置：{createLat.toFixed(6)}, {createLng.toFixed(6)}
            </p>

            <div>
              <label className="block text-sm font-medium">タイトル</label>
              <input
                className="w-full border rounded-soft px-4 py-3 shadow-soft"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">説明</label>
              <textarea
                className="w-full border rounded-soft px-4 py-3 shadow-soft"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">種類</label>
              <select
                className="w-full border rounded-soft px-4 py-3 shadow-soft"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                <option value="fire">火災</option>
                <option value="crime">犯罪</option>
                <option value="elderly">高齢者徘徊</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">危険レベル</label>
              <select
                className="w-full border rounded-soft px-4 py-3 shadow-soft"
                value={newLevel}
                onChange={(e) => setNewLevel(Number(e.target.value))}
              >
                <option value={1}>1（軽度）</option>
                <option value={2}>2（注意）</option>
                <option value={3}>3（警戒）</option>
                <option value={4}>4（危険）</option>
                <option value={5}>5（最危険）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">半径（m）</label>
              <input
                type="number"
                className="w-full border rounded-soft px-4 py-3 shadow-soft"
                value={newRadius}
                onChange={(e) => setNewRadius(Number(e.target.value))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-4 py-3 bg-gray-500 text-white rounded-soft shadow-soft hover:bg-gray-600"
                onClick={() => setCreating(false)}
              >
                キャンセル
              </button>

              <button
                className="px-4 py-3 bg-green-600 text-white rounded-soft shadow-soft hover:bg-green-700"
                onClick={saveCreate}
              >
                追加する
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editingArea && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999]">
          <div className="bg-white p-6 rounded-soft shadow-strong w-[90%] max-w-md space-y-4">

            <h2 className="text-xl font-bold">危険エリアを編集</h2>

            <div>
              <label className="block text-sm font-medium">タイトル</label>
              <input
                className="w-full border rounded-soft px-4 py-3 shadow-soft"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">説明</label>
              <textarea
                className="w-full border rounded-soft px-4 py-3 shadow-soft"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">危険レベル</label>
              <select
                className="w-full border rounded-soft px-4 py-3 shadow-soft"
                value={editLevel}
                onChange={(e) => setEditLevel(Number(e.target.value))}
              >
                <option value={1}>1（軽度）</option>
                <option value={2}>2（注意）</option>
                <option value={3}>3（警戒）</option>
                <option value={4}>4（危険）</option>
                <option value={5}>5（最危険）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">半径（m）</label>
              <input
                type="number"
                className="w-full border rounded-soft px-4 py-3 shadow-soft"
                value={editRadius}
                onChange={(e) => setEditRadius(Number(e.target.value))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                className="px-4 py-3 bg-gray-500 text-white rounded-soft shadow-soft hover:bg-gray-600"
                onClick={() => setEditingArea(null)}
              >
                キャンセル
              </button>

              <button
                className="px-4 py-3 bg-blue-600 text-white rounded-soft shadow-soft hover:bg-blue-700"
                onClick={saveEdit}
              >
                保存
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
