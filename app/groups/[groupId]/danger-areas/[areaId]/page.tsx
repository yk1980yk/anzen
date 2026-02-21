"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";

export default function DangerAreaDetailPage() {
  const params = useParams();
  const router = useRouter();

  const groupId = params.groupId as string;
  const areaId = params.areaId as string;

  const [area, setArea] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

      setArea(data);
      setLoading(false);
    };

    fetchArea();
  }, [groupId, areaId]);

  const handleDelete = async () => {
    const ok = confirm("本当に削除しますか？");
    if (!ok) return;

    const { error } = await supabase
      .from("danger_areas")
      .delete()
      .eq("id", areaId)
      .eq("group_id", groupId);

    if (error) {
      alert("削除に失敗しました：" + error.message);
      return;
    }

    router.push(`/groups/${groupId}/danger-areas`);
  };

  if (loading) return <p style={{ padding: 20 }}>読み込み中...</p>;
  if (!area) return <p style={{ padding: 20 }}>データが見つかりません。</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{area.name}</h1>
      <p>レベル: {area.level}</p>
      <p>緯度: {area.latitude}</p>
      <p>経度: {area.longitude}</p>
      <p>半径: {area.radius} m</p>

      <button
        onClick={() =>
          router.push(`/groups/${groupId}/danger-areas/${areaId}/edit`)
        }
        style={{ marginTop: 20 }}
      >
        編集する
      </button>

      <button
        onClick={handleDelete}
        style={{
          marginTop: 20,
          marginLeft: 10,
          color: "white",
          background: "red",
          padding: "8px 12px",
          borderRadius: 4,
        }}
      >
        削除する
      </button>
    </div>
  );
}
