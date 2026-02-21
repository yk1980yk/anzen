"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthUserNewPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // 通知バナー
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerType, setBannerType] = useState<"success" | "error">("success");

  const showNotification = (message: string, type: "success" | "error") => {
    setBannerMessage(message);
    setBannerType(type);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/auth-user-create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const result = await res.json();
    setLoading(false);

    if (result.success) {
      showNotification("ユーザーを作成しました", "success");
      setTimeout(() => router.push("/dashboard/auth-users"), 800);
    } else {
      showNotification("作成に失敗しました: " + result.error, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 max-w-xl mx-auto space-y-6">

      {/* 通知バナー */}
      {showBanner && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-soft shadow-strong text-white z-[9999] ${
            bannerType === "success" ? "bg-blue-600" : "bg-red-600"
          }`}
        >
          {bannerMessage}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Authユーザー新規作成</h1>

      <form onSubmit={handleCreate} className="anzen-card p-5 space-y-5">

        <div>
          <label className="block mb-1 font-medium">メールアドレス</label>
          <input
            type="email"
            className="w-full border rounded-soft px-4 py-3 shadow-soft focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">パスワード</label>
          <input
            type="password"
            className="w-full border rounded-soft px-4 py-3 shadow-soft focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded-soft shadow-soft w-full hover:bg-blue-700 transition font-semibold"
        >
          {loading ? "作成中..." : "作成する"}
        </button>
      </form>
    </div>
  );
}
