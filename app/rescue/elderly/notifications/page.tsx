"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import Link from "next/link";

export default function ElderlyNotifications() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ============================================
     ★ 3つのテーブルをまとめて取得
     elderly_sos
     elderly_safe
     elderly_fall
  ============================================ */
  useEffect(() => {
    const fetchAll = async () => {
      const { data: sos } = await supabase
        .from("elderly_sos")
        .select(
          `
          *,
          profiles!elderly_sos_user_id_fkey (
            name,
            avatar_url,
            email
          )
        `
        );

      const { data: safe } = await supabase
        .from("elderly_safe")
        .select(
          `
          *,
          profiles!elderly_safe_user_id_fkey (
            name,
            avatar_url,
            email
          )
        `
        );

      const { data: fall } = await supabase
        .from("elderly_fall")
        .select(
          `
          *,
          profiles!elderly_fall_user_id_fkey (
            name,
            avatar_url,
            email
          )
        `
        );

      // それぞれに type を付与
      const sosLogs = (sos || []).map((l) => ({ ...l, type: "sos" }));
      const safeLogs = (safe || []).map((l) => ({ ...l, type: "safe" }));
      const fallLogs = (fall || []).map((l) => ({ ...l, type: "fall" }));

      // 全部まとめて時系列で並べる
      const merged = [...sosLogs, ...safeLogs, ...fallLogs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setLogs(merged);
      setLoading(false);
    };

    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-circle"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E8] p-6 pt-20">
      <Header title="見守り通知一覧" />

      {logs.length === 0 && (
        <p className="text-gray-600 mt-4">通知はまだありません</p>
      )}

      <div className="space-y-4 mt-4 mb-10">
        {logs.map((log) => {
          const name =
            log.profiles?.name ||
            log.profiles?.email ||
            log.user_id?.substring(0, 8);

          const avatar =
            log.profiles?.avatar_url ||
            "https://cdn-icons-png.flaticon.com/512/456/456212.png";

          const time = new Date(log.created_at).toLocaleString();

          /* ============================================
             ★ 種類ごとのデザイン
          ============================================ */
          let borderColor = "#F5A623";
          let label = "🧡 助けて";
          let textColor = "#D35400";
          let mapLink = null;

          if (log.type === "safe") {
            borderColor = "#27AE60";
            label = "🟢 元気です";
            textColor = "#27AE60";
          }

          if (log.type === "fall") {
            borderColor = "#E74C3C";
            label = "⚠️ 転倒の可能性";
            textColor = "#E74C3C";
          }

          if (log.type === "sos") {
            mapLink = `/map?lat=${log.lat}&lng=${log.lng}`;
          }

          return (
            <div
              key={log.id}
              className="flex items-center gap-4 p-4 rounded-xl shadow-soft bg-white"
              style={{ borderLeft: `6px solid ${borderColor}` }}
            >
              <img
                src={avatar}
                className="w-14 h-14 rounded-full object-cover"
                style={{ border: `3px solid ${borderColor}` }}
              />

              <div className="flex-1">
                <div className="font-bold text-gray-800 text-lg">{name}</div>

                <div className="text-sm text-gray-600 mt-1">{time}</div>

                <div
                  className="text-sm font-semibold mt-2"
                  style={{ color: textColor }}
                >
                  {label}
                </div>

                {mapLink && (
                  <Link
                    href={mapLink}
                    className="text-orange-600 text-sm font-semibold mt-2 inline-block"
                  >
                    📍 マップで開く
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
