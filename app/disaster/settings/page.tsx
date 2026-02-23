"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export default function DisasterSettingsPage() {
  // ★ 設定値
  const [visibility, setVisibility] = useState("family_nearby");
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [alarmVolume, setAlarmVolume] = useState(0.8);
  const [alarmType, setAlarmType] = useState("siren");

  // ★ 家族追加フォーム
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  // ★ 家族一覧
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  // ★ 承認通知バナー
  const [showApprovedBanner, setShowApprovedBanner] = useState(false);

  // Supabase クライアント
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ★ 初期表示時に localStorage から読み込み
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedVisibility = localStorage.getItem("disaster_visibility");
    if (savedVisibility) {
      setVisibility(savedVisibility);
    }

    // ★ 家族承認フラグをチェック
    if (localStorage.getItem("family_approved")) {
      setShowApprovedBanner(true);
      localStorage.removeItem("family_approved");
    }
  }, []);

  // ★ visibility が変わったら localStorage に保存
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("disaster_visibility", visibility);
  }, [visibility]);

  /* ============================
     ★ 家族招待処理
  ============================ */
  const sendInvite = async () => {
    setInviteMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setInviteMessage("ログインが必要です");
      return;
    }

    const { data: targetUser, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", inviteEmail)
      .single();

    if (userError || !targetUser) {
      setInviteMessage("このメールのユーザーが見つかりません");
      return;
    }

    const { error } = await supabase.from("family_links").insert({
      user_id: user.id,
      family_user_id: targetUser.id,
      status: "pending",
    });

    if (error) {
      setInviteMessage("招待に失敗しました");
      return;
    }

    setInviteMessage("招待を送信しました（承認待ち）");
    setInviteEmail("");

    fetchFamilyData();
  };

  /* ============================
     ★ 家族一覧を取得
  ============================ */
  const fetchFamilyData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // ★ 承認済みの家族
    const { data: approved } = await supabase
      .from("family_links")
      .select("id, family_user_id, profiles!family_links_family_user_id_fkey(email)")
      .eq("user_id", user.id)
      .eq("status", "approved");

    if (approved) setFamilyMembers(approved);

    // ★ 自分が送った pending 招待
    const { data: pending } = await supabase
      .from("family_links")
      .select("id, family_user_id, profiles!family_links_family_user_id_fkey(email)")
      .eq("user_id", user.id)
      .eq("status", "pending");

    if (pending) setPendingInvites(pending);
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  /* ============================
     ★ 家族解除（削除）
  ============================ */
  const removeFamily = async (id: string) => {
    const { error } = await supabase
      .from("family_links")
      .delete()
      .eq("id", id);

    if (error) {
      alert("解除に失敗しました");
      return;
    }

    fetchFamilyData();
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
      {/* ★ 承認通知バナー */}
      {showApprovedBanner && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#2563EB",
            padding: "12px 20px",
            borderRadius: "8px",
            color: "white",
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          家族が承認されました！
        </div>
      )}

      {/* 戻る */}
      <Link href="/disaster" style={{ color: "white", fontSize: "20px" }}>
        ← 戻る
      </Link>

      <h1 style={{ marginTop: "20px", fontSize: "28px" }}>災害モード設定</h1>

      {/* ① SOS公開範囲 */}
      <section style={{ marginTop: "30px" }}>
        <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
          SOS公開範囲
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label>
            <input
              type="radio"
              name="visibility"
              value="all"
              checked={visibility === "all"}
              onChange={() => setVisibility("all")}
            />
            全ユーザーに公開
          </label>

          <label>
            <input
              type="radio"
              name="visibility"
              value="nearby"
              checked={visibility === "nearby"}
              onChange={() => setVisibility("nearby")}
            />
            近くのユーザーのみ
          </label>

          <label>
            <input
              type="radio"
              name="visibility"
              value="family_nearby"
              checked={visibility === "family_nearby"}
              onChange={() => setVisibility("family_nearby")}
            />
            家族＋近くのユーザー（推奨）
          </label>

          <label>
            <input
              type="radio"
              name="visibility"
              value="family_only"
              checked={visibility === "family_only"}
              onChange={() => setVisibility("family_only")}
            />
            家族のみ
          </label>
        </div>
      </section>

      {/* ② アラーム設定 */}
      <section style={{ marginTop: "40px" }}>
        <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
          アラーム設定
        </h2>

        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={alarmEnabled}
            onChange={(e) => setAlarmEnabled(e.target.checked)}
          />
          アラームを鳴らす
        </label>

        <div style={{ marginTop: "10px" }}>
          音量：
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={alarmVolume}
            onChange={(e) => setAlarmVolume(Number(e.target.value))}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          音の種類：
          <select
            value={alarmType}
            onChange={(e) => setAlarmType(e.target.value)}
            style={{ padding: "6px", borderRadius: "6px" }}
          >
            <option value="siren">サイレン</option>
            <option value="beep">ビープ音</option>
            <option value="alert">警告音</option>
          </select>
        </div>
      </section>

      {/* ③ 家族・グループ設定 */}
      <section style={{ marginTop: "40px" }}>
        <h2 style={{ fontSize: "22px", marginBottom: "10px" }}>
          家族・グループ設定
        </h2>

        <p style={{ opacity: 0.8 }}>
          ※ 家族を追加すると、災害SOSの「家族のみ」「家族＋近くのユーザー」が正しく動作します。
        </p>

        {/* ★ 家族一覧 */}
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#333",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>現在の家族</h3>

          {familyMembers.length === 0 ? (
            <p style={{ opacity: 0.7 }}>家族が登録されていません</p>
          ) : (
            <ul style={{ marginLeft: "20px" }}>
              {familyMembers.map((f) => (
                <li
                  key={f.id}
                  style={{
                    marginBottom: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {f.profiles.email}

                  <button
                    onClick={() => removeFamily(f.id)}
                    style={{
                      padding: "6px 10px",
                      background: "#e53935",
                      color: "white",
                      borderRadius: "6px",
                      border: "none",
                      fontSize: "12px",
                    }}
                  >
                    解除
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* ★ pending 招待 */}
          {pendingInvites.length > 0 && (
            <>
              <h4 style={{ marginTop: "16px" }}>承認待ちの招待</h4>
              <ul style={{ marginLeft: "20px" }}>
                {pendingInvites.map((p) => (
                  <li key={p.id} style={{ opacity: 0.7 }}>
                    {p.profiles.email}（承認待ち）
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* ★ 承認画面への導線 */}
          <Link
            href="/family/invites"
            style={{
              display: "block",
              marginTop: "20px",
              padding: "10px",
              background: "#2563EB",
              color: "white",
              textAlign: "center",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            家族招待の承認へ
          </Link>
        </div>

        {/* 家族追加フォーム */}
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#333",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>家族を追加</h3>

          <input
            type="email"
            placeholder="相手のメールアドレス"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #555",
              marginBottom: "10px",
            }}
          />

          <button
            onClick={sendInvite}
            style={{
              width: "100%",
              padding: "10px",
              background: "#2563EB",
              color: "white",
              borderRadius: "6px",
              border: "none",
              fontWeight: "bold",
            }}
          >
            招待を送る
          </button>

          {inviteMessage && (
            <p style={{ marginTop: "10px", color: "#FFD700" }}>
              {inviteMessage}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
