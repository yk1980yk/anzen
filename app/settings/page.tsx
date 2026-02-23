"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "../components/Header";
import ToggleSwitch from "../components/ui/ToggleSwitch";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // ★ 設定項目（4つのモード）
  const [crimeMode, setCrimeMode] = useState(true);
  const [rescueMode, setRescueMode] = useState(true);
  const [sosMode, setSosMode] = useState(true);
  const [elderMode, setElderMode] = useState(true);

  // ★ 通知設定
  const [enableNotification, setEnableNotification] = useState(true);
  const [enableSound, setEnableSound] = useState(true);

  // ★ 危険レベル
  const [level1, setLevel1] = useState(true);
  const [level2, setLevel2] = useState(true);
  const [level3, setLevel3] = useState(true);

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

      if (data) {
        setProfile(data);

        // ★ DB の値を UI に反映
        setCrimeMode(data.enable_crime_mode ?? true);
        setRescueMode(data.enable_rescue_mode ?? true);
        setSosMode(data.enable_sos_mode ?? true);
        setElderMode(data.enable_elder_mode ?? true);
      }

      setLoading(false);
    };

    load();
  }, []);

  // ★ 保存処理
  const saveSettings = async () => {
    if (!profile) return;

    await supabase
      .from("profiles")
      .update({
        enable_crime_mode: crimeMode,
        enable_rescue_mode: rescueMode,
        enable_sos_mode: sosMode,
        enable_elder_mode: elderMode,
      })
      .eq("id", profile.id);

    alert("設定を保存しました");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-circle"></div>
      </div>
    );
  }

  return (
    <>
      <Header title="設定" />

      <div className="fixed inset-0 overflow-y-auto bg-[#FFF8E8] p-6 pt-24 space-y-8 z-[999999999]">

        {/* 通知設定 */}
        <div>
          <h2 className="text-lg font-bold mb-3">通知設定</h2>

          <div className="flex items-center justify-between mb-4">
            <span>通知を有効にする</span>
            <ToggleSwitch
              value={enableNotification}
              onChange={setEnableNotification}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>サウンドを有効にする</span>
            <ToggleSwitch
              value={enableSound}
              onChange={setEnableSound}
            />
          </div>
        </div>

        {/* 危険レベル表示 */}
        <div>
          <h2 className="text-lg font-bold mb-3">危険レベルの表示</h2>

          <div className="flex items-center justify-between mb-4">
            <span>レベル1（注意）</span>
            <ToggleSwitch value={level1} onChange={setLevel1} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span>レベル2（警告）</span>
            <ToggleSwitch value={level2} onChange={setLevel2} />
          </div>

          <div className="flex items-center justify-between">
            <span>レベル3（危険）</span>
            <ToggleSwitch value={level3} onChange={setLevel3} />
          </div>
        </div>

        {/* 表示するモード */}
        <div>
          <h2 className="text-lg font-bold mb-3">表示するモード</h2>

          <div className="flex items-center justify-between mb-4">
            <span>🛡 防犯モード</span>
            <ToggleSwitch value={crimeMode} onChange={setCrimeMode} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span>🚨 救助要請モード</span>
            <ToggleSwitch value={rescueMode} onChange={setRescueMode} />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span>🗺 遭難モード</span>
            <ToggleSwitch value={sosMode} onChange={setSosMode} />
          </div>

          <div className="flex items-center justify-between">
            <span>👵 高齢者見守りモード</span>
            <ToggleSwitch value={elderMode} onChange={setElderMode} />
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={saveSettings}
          className="w-full p-4 bg-blue-600 text-white rounded-lg font-bold shadow active:scale-95"
        >
          保存する
        </button>

      </div>
    </>
  );
}
