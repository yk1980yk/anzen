"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Group = {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  type?: string;
};

export default function GroupsPage() {
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: memberData } = await supabase
        .from("group_members")
        .select("*, group:groups(*)")
        .eq("user_id", user.id);

      const uniqueGroups =
        memberData
          ?.map((m) => m.group as Group)
          .filter(
            (g, i, arr) =>
              g && arr.findIndex((x) => x.id === g.id) === i
          ) || [];

      setGroups(uniqueGroups);
      setLoading(false);
    };

    fetchGroups();
  }, []);

  if (loading) return <p className="p-6">読み込み中...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">参加中のグループ</h1>

      {groups.length === 0 ? (
        <p>まだグループに参加していません。</p>
      ) : (
        <ul className="space-y-4">
          {groups.map((g) => (
            <li
              key={g.id}
              className="border p-4 rounded shadow-sm cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/groups/${g.id}`)}
            >
              <h2 className="text-xl font-semibold">{g.name}</h2>
              <p className="text-gray-600">{g.description}</p>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => router.push("/groups/new")}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg"
      >
        ＋ 新規グループ
      </button>
    </div>
  );
}
