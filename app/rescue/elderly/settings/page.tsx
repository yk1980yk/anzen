"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabaseClient";

export default function ElderlySettings() {
  const [fallDetect, setFallDetect] = useState(false);
  const [notifySOS, setNotifySOS] = useState(true);
  const [notifySafe, setNotifySafe] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);

  const [loading, setLoading] = useState(true);

  /* ============================================
     ★ 設定を取得（profiles に保存する想定）
  ============================================ */
  useEffect(() => {
    const loadSettings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("elderly_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setFallDetect(data.fall_detect);
        setNotifySOS(data.notify_sos);
        setNotifySafe(data.notify_safe);
        setShareLocation(data.share_location);
      }

      setLoading(false);
    };

    loadSettings();
  }, []);

  /* ============================================
     ★ 設定を保存
  ============================================ */
  const saveSetting = async (key: string, value: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: exists } = await supabase
      .from("elderly_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (exists) {
      await supabase
        .from("elderly_settings")
        .update({ [key]: value })
        .eq("user_id", user.id);
    } else {
      await supabase.from("elderly_settings").insert({
        user_id: user.id,
        [key]: value,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-circle"></div>
      </div>
    );
  }

  /* ============================================
     ★ UI（優しい色合い）
  ============================================ */
  return (
    <div className="min-h-screen bg-[#FFF8E8] p-6 pt-20">
      <Header title="見守り設定" />

      <div className="space-y-6 mt-4">

        {/* 転倒検知 */}
        <SettingCard
          title="転倒検知"
          description="スマホの動きを検知して、転倒の可能性がある場合に確認します"
          value={fallDetect}
          onChange={(v) => {
            setFallDetect(v);
            saveSetting("fall_detect", v);
          }}
        />

        {/* 助けて通知 */}
        <SettingCard
          title="助けて通知"
          description="「助けて」が押されたときに家族へ通知します"
          value={notifySOS}
          onChange={(v) => {
            setNotifySOS(v);
            saveSetting("notify_sos", v);
          }}
        />

        {/* 元気です通知 */}
        <SettingCard
          title="元気です通知"
          description="「元気です」が送信されたときに家族へ通知します"
          value={notifySafe}
          onChange={(v) => {
            setNotifySafe(v);
            saveSetting("notify_safe", v);
          }}
        />

        {/* 位置共有 */}
        <SettingCard
          title="位置情報の共有"
          description="家族があなたの現在地を確認できるようにします"
          value={shareLocation}
          onChange={(v) => {
            setShareLocation(v);
            saveSetting("share_location", v);
          }}
        />
      </div>
    </div>
  );
}

/* ============================================
   ★ 設定カード（共通UI）
============================================ */
function SettingCard({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-soft">
      <div className="flex justify-between items-center">
        <div>
          <div className="font-bold text-gray-800 text-lg">{title}</div>
          <div className="text-sm text-gray-600 mt-1">{description}</div>
        </div>

        <button
          onClick={() => onChange(!value)}
          className={`w-14 h-8 rounded-full flex items-center transition ${
            value ? "bg-orange-400" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow transform transition ${
              value ? "translate-x-6" : "translate-x-1"
            }`}
          ></div>
        </button>
      </div>
    </div>
  );
}
