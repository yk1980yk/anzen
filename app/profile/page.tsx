"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export default function ProfilePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // ★ 初期読み込み
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setName(profile.name || "");
        setAvatarUrl(profile.avatar_url || "");
        setPreviewUrl(profile.avatar_url || "");
      }
    };

    loadProfile();
  }, []);

  /* ============================================
     ★ 画像アップロード処理
  ============================================ */
  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      setMessage("");

      const file = event.target.files[0];
      if (!file) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("ログインが必要です");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // ★ Storage にアップロード
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setMessage("画像のアップロードに失敗しました");
        return;
      }

      // ★ 公開URLを取得
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // ★ プレビュー更新
      setPreviewUrl(publicUrl);

      // ★ プロフィールに保存
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        setMessage("プロフィール更新に失敗しました");
        return;
      }

      setAvatarUrl(publicUrl);
      setMessage("画像を更新しました！");
    } catch (error) {
      setMessage("エラーが発生しました");
    } finally {
      setUploading(false);
    }
  };

  /* ============================================
     ★ 名前の保存
  ============================================ */
  const saveProfile = async () => {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("ログインが必要です");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
      })
      .eq("id", user.id);

    if (error) {
      setMessage("保存に失敗しました");
      return;
    }

    setMessage("プロフィールを保存しました");
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
      <Link href="/" style={{ color: "white", fontSize: "20px" }}>
        ← 戻る
      </Link>

      <h1 style={{ marginTop: "20px", fontSize: "28px" }}>プロフィール設定</h1>

      {message && (
        <p style={{ marginTop: "10px", color: "#FFD700" }}>{message}</p>
      )}

      {/* ★ アイコン画像プレビュー（シルエット fallback） */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <img
          src={
            previewUrl
              ? previewUrl
              : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #2563EB",
          }}
        />

        <label
          style={{
            display: "block",
            marginTop: "12px",
            padding: "8px",
            background: "#2563EB",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {uploading ? "アップロード中..." : "画像を選択"}
          <input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* ★ メール（読み取り専用） */}
      <div style={{ marginTop: "30px" }}>
        <label>メールアドレス（変更不可）</label>
        <input
          type="text"
          value={email}
          readOnly
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #555",
            marginTop: "6px",
            background: "#444",
            color: "#ccc",
          }}
        />
      </div>

      {/* ★ 名前 */}
      <div style={{ marginTop: "20px" }}>
        <label>名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：山田太郎"
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #555",
            marginTop: "6px",
          }}
        />
      </div>

      <button
        onClick={saveProfile}
        style={{
          marginTop: "30px",
          width: "100%",
          padding: "12px",
          background: "#2563EB",
          color: "white",
          borderRadius: "6px",
          border: "none",
          fontWeight: "bold",
        }}
      >
        保存する
      </button>
    </div>
  );
}
