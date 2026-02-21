"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initialCode = searchParams.get("code");
    if (initialCode) setCode(initialCode);
  }, [searchParams]);

  const handleJoin = async () => {
    setMessage(null);
    if (!code.trim()) {
      setMessage("招待コードを入力してください。");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("ログインが必要です。");
      setLoading(false);
      return;
    }

    const { data: group } = await supabase
      .from("groups")
      .select("*")
      .eq("invite_code", code.trim())
      .single();

    if (!group) {
      setMessage("この招待コードのグループが見つかりません。");
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from("group_members")
      .select("*")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      setMessage("すでにこのグループに参加しています。");
      setLoading(false);
      return;
    }

    await supabase.from("group_members").insert({
      group_id: group.id,
      user_id: user.id,
      role: "child",
    });

    setMessage("グループに参加しました。");
    setLoading(false);
    router.push(`/groups/${group.id}`);
  };

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 400,
        margin: "40px auto",
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <h1>招待コードで参加</h1>
      <p style={{ fontSize: 14, color: "#555" }}>
        家族やグループから共有された招待コードを入力してください。
      </p>

      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="例：c78992"
        style={{
          width: "100%",
          padding: 10,
          marginTop: 10,
          marginBottom: 10,
          border: "1px solid #ccc",
          borderRadius: 4,
        }}
      />

      <button
        onClick={handleJoin}
        disabled={loading}
        style={{
          width: "100%",
          padding: 10,
          background: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        {loading ? "参加中..." : "参加する"}
      </button>

      {message && (
        <p style={{ marginTop: 10, fontSize: 14, color: "#d00" }}>{message}</p>
      )}
    </div>
  );
}
