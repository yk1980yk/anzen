"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  // プロフィール取得
  useEffect(() => {
    const fetchProfile = async () => {
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

    fetchProfile();
  }, []);

  if (!profile) return <div className="px-4 pt-20">読み込み中...</div>;

  // 統一デザインのカード
  const Card = ({
    icon,
    title,
    description,
    color,
    onClick,
  }: {
    icon: string;
    title: string;
    description: string;
    color: string;
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className="w-full p-4 rounded-soft shadow-soft cursor-pointer transition-transform hover:scale-[1.02] bg-white flex items-center space-x-4"
      style={{
        borderLeft: `10px solid ${color}`,
      }}
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 px-4 pt-4 flex flex-col gap-4">
      {/* ★ 共通ヘッダー */}
      <Header title="ANZEN ホーム" />

      {/* 🛡 防犯モード（常に表示） */}
      <Card
        icon="🛡"
        title="防犯モード"
        description="街中の危険を回避し、安全を守るモード"
        color="#1E90FF"
        onClick={() => router.push("/crime")}
      />

      {/* 🚨 救助要請モード（課金済み & ON のときだけ表示） */}
      {profile.paid_elder_mode && profile.enable_elder_mode && (
        <Card
          icon="🚨"
          title="救助要請モード"
          description="災害・高齢者の動けないSOSに対応"
          color="#FF4D4D"
          onClick={() => router.push("/rescue")}
        />
      )}

      {/* 🗺 遭難モード（課金済み & ON のときだけ表示） */}
      {profile.paid_sos_mode && profile.enable_sos_mode && (
        <Card
          icon="🗺"
          title="遭難モード"
          description="音声ナビで安全な場所へ誘導"
          color="#1E90FF"
          onClick={() => router.push("/sos")}
        />
      )}
    </div>
  );
}
