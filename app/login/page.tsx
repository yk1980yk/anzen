"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("メールアドレスまたはパスワードが違います");
    } else {
      router.push("/user-map");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">

      {/* ロゴ */}
      <div className="mb-10 text-center">
        <img src="/logo.png" alt="ANZEN" className="w-20 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">ANZEN</h1>
        <p className="text-gray-600 mt-2">ログインして安全を守ろう</p>
      </div>

      {/* カード */}
      <div className="anzen-card w-full max-w-sm space-y-4">

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-4 py-2 rounded-soft shadow-soft"
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded-soft shadow-soft"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button onClick={handleLogin} className="anzen-btn-primary">
          ログイン
        </button>

        <button
          onClick={() => router.push("/signup")}
          className="anzen-btn-secondary"
        >
          新規登録はこちら
        </button>

      </div>

    </div>
  );
}
