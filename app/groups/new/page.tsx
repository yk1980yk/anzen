"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState("family");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("ログインしてください");
      return;
    }

    const { data, error } = await supabase
      .from("groups")
      .insert({
        name,
        type,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      alert("エラー: " + error.message);
      setLoading(false);
      return;
    }

    // 作成者を group_members に追加
    await supabase.from("group_members").insert({
      group_id: data.id,
      user_id: user.id,
      role: "parent", // デフォルトは親扱い
    });

    alert("グループを作成しました！");
    router.push("/groups");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>グループ作成</h1>

      <label>グループ名</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />

      <label>グループタイプ</label>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        style={{ display: "block", marginBottom: 20 }}
      >
        <option value="family">家族</option>
        <option value="couple">カップル</option>
        <option value="school">学校</option>
        <option value="temporary">一時的</option>
      </select>

      <button onClick={handleCreate} disabled={loading}>
        {loading ? "作成中..." : "作成する"}
      </button>
    </div>
  );
}
