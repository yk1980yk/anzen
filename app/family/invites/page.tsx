"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function FamilyInvitesPage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ★ 自分宛の pending 招待を取得
  const fetchInvites = async () => {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("ログインが必要です");
      return;
    }

    const { data, error } = await supabase
      .from("family_links")
      .select("id, user_id, created_at, profiles!family_links_user_id_fkey(email)")
      .eq("family_user_id", user.id)
      .eq("status", "pending");

    if (error) {
      setMessage("招待の取得に失敗しました");
      return;
    }

    setInvites(data || []);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  // ★ 承認処理（ここにフラグ追加）
  const approveInvite = async (id: string) => {
    setMessage("");

    const { error } = await supabase
      .from("family_links")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      setMessage("承認に失敗しました");
      return;
    }

    // ★ 設定画面で通知するためのフラグ
    if (typeof window !== "undefined") {
      localStorage.setItem("family_approved", "1");
    }

    setMessage("承認しました！");
    fetchInvites();
  };

  // ★ 拒否（削除）
  const rejectInvite = async (id: string) => {
    setMessage("");

    const { error } = await supabase
      .from("family_links")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage("拒否に失敗しました");
      return;
    }

    setMessage("招待を拒否しました");
    fetchInvites();
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#222",
        color: "white",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "26px", marginBottom: "20px" }}>
        家族招待の承認
      </h1>

      {message && (
        <p style={{ marginBottom: "20px", color: "#FFD700" }}>{message}</p>
      )}

      {invites.length === 0 ? (
        <p>承認待ちの招待はありません。</p>
      ) : (
        invites.map((invite) => (
          <div
            key={invite.id}
            style={{
              background: "#333",
              padding: "14px",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <p>招待元: {invite.profiles.email}</p>
            <p style={{ opacity: 0.7, fontSize: "14px" }}>
              送信日時: {new Date(invite.created_at).toLocaleString()}
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "12px",
              }}
            >
              <button
                onClick={() => approveInvite(invite.id)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#2563EB",
                  color: "white",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                承認する
              </button>

              <button
                onClick={() => rejectInvite(invite.id)}
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "#e53935",
                  color: "white",
                  borderRadius: "6px",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                拒否する
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
