"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    soundEnabled: true,
    level1: true,
    level2: true,
    level3: true,
  });

  // 初期読み込み
  useEffect(() => {
    const saved = localStorage.getItem("anzen-settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // 保存処理（変更のたびに保存）
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("anzen-settings", JSON.stringify(newSettings));
  };

  return (
    <div className="p-6 space-y-6 pb-20">

      <h1 className="text-2xl font-bold">設定</h1>

      {/* 通知設定 */}
      <div className="anzen-card space-y-4">
        <h2 className="text-lg font-semibold">通知設定</h2>

        <label className="flex items-center justify-between">
          <span>通知を有効にする</span>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) => updateSetting("notificationsEnabled", e.target.checked)}
            className="w-5 h-5"
          />
        </label>

        <label className="flex items-center justify-between">
          <span>サウンドを有効にする</span>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSetting("soundEnabled", e.target.checked)}
            className="w-5 h-5"
          />
        </label>
      </div>

      {/* 危険レベル表示設定 */}
      <div className="anzen-card space-y-4">
        <h2 className="text-lg font-semibold">危険レベルの表示</h2>

        <label className="flex items-center justify-between">
          <span>レベル 1（注意）</span>
          <input
            type="checkbox"
            checked={settings.level1}
            onChange={(e) => updateSetting("level1", e.target.checked)}
            className="w-5 h-5"
          />
        </label>

        <label className="flex items-center justify-between">
          <span>レベル 2（警告）</span>
          <input
            type="checkbox"
            checked={settings.level2}
            onChange={(e) => updateSetting("level2", e.target.checked)}
            className="w-5 h-5"
          />
        </label>

        <label className="flex items-center justify-between">
          <span>レベル 3（危険）</span>
          <input
            type="checkbox"
            checked={settings.level3}
            onChange={(e) => updateSetting("level3", e.target.checked)}
            className="w-5 h-5"
          />
        </label>
      </div>

      {/* 戻る */}
      <button
        onClick={() => history.back()}
        className="text-blue-600 underline block text-center mt-4"
      >
        戻る
      </button>

    </div>
  );
}
