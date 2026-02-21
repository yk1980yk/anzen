"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: memberData } = await supabase
        .from("group_members")
        .select("group:groups(*), role")
        .eq("user_id", user.id);

      const uniqueGroups =
        memberData
          ?.map((m) => m.group)
          .filter((g, i, arr) => g && arr.findIndex((x) => x.id === g.id) === i) || [];

      setGroups(uniqueGroups);
      setLoading(false);
    };

    fetchGroups();
  }, [router]);

  if (loading) return <p style={{ padding: 20 }}>読み込み中...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>グループ一覧</h1>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => router.push("/groups/new")}
          style={{ marginRight: 10 }}
        >
          ＋ 新しいグループを作成
        </button>
        <button onClick={() => router.push("/join")}>招待コードで参加</button>
      </div>

      {groups.length === 0 ? (
        <p>まだグループがありません。</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {groups.map((g) => (
            <div
              key={g.id}
              onClick={() => router.push(`/groups/${g.id}`)}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                cursor: "pointer",
              }}
            >
              <h2 style={{ margin: "0 0 8px" }}>
                {g.name || "名前未設定のグループ"}
              </h2>
              <p style={{ margin: "0 0 4px" }}>タイプ：{g.type}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
                ID: {g.id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
