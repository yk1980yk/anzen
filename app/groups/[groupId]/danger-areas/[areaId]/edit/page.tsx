"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

export default function EditDangerAreaPage() {
  const params = useParams();
  const router = useRouter();

  const groupId = params.groupId as string;
  const areaId = params.areaId as string;

  const [name, setName] = useState("");
  const [level, setLevel] = useState(1);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchArea = async () => {
      const { data, error } = await supabase
        .from("danger_areas")
        .select("*")
        .eq("id", areaId)
        .eq("group_id", groupId)
        .single();

      if (error) {
        console.error(error);
      }

      if (data) {
        setName(data.name);
        setLevel(data.level);
        setLatitude(String(data.latitude));
        setLongitude(String(data.longitude));
        setRadius(String(data.radius));
      }
    };

    fetchArea();
  }, [groupId, areaId]);

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("danger_areas")
      .update({
        name,
        level,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius: Number(radius),
      })
      .eq("id", areaId)
      .eq("group_id", groupId);

    if (error) {
      setMessage("更新に失敗しました：" + error.message);
      return;
    }

    router.push(`/groups/${groupId}/danger-areas/${areaId}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>危険エリアを編集</h1>

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
        <option value={2}>レレベル 2（警戒）</option>
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

      <button onClick={handleUpdate}>更新する</button>

      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
}
