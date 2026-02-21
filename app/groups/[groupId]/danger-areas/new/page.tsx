"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";

// ★ 逆ジオコーディングで都市名を取得する関数
async function fetchCityName(lat: number, lon: number) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ja`;
    const res = await fetch(url);
    const data = await res.json();

    // 市区町村名を抽出（日本の場合）
    return (
      data?.address?.city ||
      data?.address?.town ||
      data?.address?.village ||
      data?.address?.municipality ||
      null
    );
  } catch (e) {
    console.error("都市名の取得に失敗:", e);
    return null;
  }
}

export default function NewDangerAreaPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    setMessage("");

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (!lat || !lon) {
      setMessage("緯度・経度が正しくありません");
      return;
    }

    // ★ 都市名を自動取得
    const city = await fetchCityName(lat, lon);

    const { error } = await supabase.from("danger_areas").insert({
      group_id: groupId,
      name,
      level,
      latitude: lat,
      longitude: lon,
      radius: Number(radius),
      city, // ← ★ 追加
    });

    if (error) {
      setMessage("作成に失敗しました：" + error.message);
      return;
    }

    router.push(`/groups/${groupId}/danger-areas`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>危険エリアを追加</h1>

      <input
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <select
        value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
        style={{ display: "block", marginBottom: 10 }}
      >
        <option value={1}>レベル 1（注意）</option>
        <option value={2}>レベル 2（警戒）</option>
        <option value={3}>レベル 3（危険）</option>
      </select>

      <input
        placeholder="緯度"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <input
        placeholder="経度"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <input
        placeholder="半径（m）"
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <button onClick={handleCreate}>作成する</button>

      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
}
