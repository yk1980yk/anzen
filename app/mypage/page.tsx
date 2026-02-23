"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Card from "@/components/ui/Card";                 // ← 修正
import PrimaryButton from "@/components/ui/PrimaryButton"; // ← 修正
import Link from "next/link";

export default function MyPage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    };

    load();
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-circle"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E8] p-6 pt-20 space-y-6">

      {/* プロフィールカード */}
      <Card>
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            className="w-20 h-20 rounded-full border-4 border-[#1976D2] object-cover"
          />

          <div>
            <div className="text-xl font-bold text-gray-800">
              {profile.name || "名前未設定"}
            </div>
            <div className="text-gray-600 text-sm mt-1">
              {profile.email}
            </div>
          </div>
        </div>
      </Card>

      {/* 家族管理 */}
      <Link href="/family">
        <Card className="border-l-8 border-[#1976D2]">
          <div className="flex items-center gap-4">
            <div className="text-3xl">👨‍👩‍👧‍👦</div>
            <div>
              <div className="text-lg font-bold text-gray-800">
                家族管理
              </div>
              <div className="text-sm text-gray-600 mt-1">
                家族の追加・削除・招待を行えます
              </div>
            </div>
          </div>
        </Card>
      </Link>

      {/* 設定 */}
      <Link href="/settings">
        <PrimaryButton variant="white">
          ⚙️ 設定を開く
        </PrimaryButton>
      </Link>

    </div>
  );
}
