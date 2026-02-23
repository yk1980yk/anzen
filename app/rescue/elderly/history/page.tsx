"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import Link from "next/link";

export default function ElderlyHistory() {
  const [sosLogs, setSosLogs] = useState<any[]>([]);
  const [safeLogs, setSafeLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ============================================
     ★ 高齢者SOS履歴
  ============================================ */
  useEffect(() => {
    const fetchSOS = async () => {
      const { data } = await supabase
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
        )
        .order("created_at", { ascending: false });

      if (data) setSosLogs(data);
    };

    fetchSOS();
  }, []);

  /* ============================================
     ★ 元気です（安否チェック）履歴
  ============================================ */
  useEffect(() => {
    const fetchSafe = async () => {
      const { data } = await supabase
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
        )
        .order("created_at", { ascending: false });

      if (data) setSafeLogs(data);

      setLoading(false);
    };

    fetchSafe();
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
      <Header title="見守り履歴" />

      {/* SOS 履歴 */}
      <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">🧡 助けて履歴</h2>

      {sosLogs.length === 0 && (
        <p className="text-gray-600 mb-6">助けて履歴はありません</p>
      )}

      <div className="space-y-4">
        {sosLogs.map((log) => {
          const name =
            log.profiles?.name ||
            log.profiles?.email ||
            log.user_id.substring(0, 8);

          const avatar =
            log.profiles?.avatar_url ||
            "https://cdn-icons-png.flaticon.com/512/456/456212.png";

          return (
            <div
              key={log.id}
              className="flex items-center gap-4 p-4 rounded-xl shadow-soft bg-white"
            >
              <img
                src={avatar}
                className="w-14 h-14 rounded-full object-cover"
                style={{
                  border: "3px solid #F5A623",
                }}
              />

              <div className="flex-1">
                <div className="font-bold text-gray-800 text-lg">{name}</div>

                <div className="text-sm text-gray-600 mt-1">
                  {new Date(log.created_at).toLocaleString()}
                </div>

                <Link
                  href={`/map?lat=${log.lat}&lng=${log.lng}`}
                  className="text-orange-600 text-sm font-semibold mt-2 inline-block"
                >
                  📍 マップで開く
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 元気です 履歴 */}
      <h2 className="text-xl font-bold text-gray-800 mt-8 mb-2">🟢 元気です履歴</h2>

      {safeLogs.length === 0 && (
        <p className="text-gray-600">元気です履歴はありません</p>
      )}

      <div className="space-y-4 mb-10">
        {safeLogs.map((log) => {
          const name =
            log.profiles?.name ||
            log.profiles?.email ||
            log.user_id.substring(0, 8);

          const avatar =
            log.profiles?.avatar_url ||
            "https://cdn-icons-png.flaticon.com/512/456/456212.png";

          return (
            <div
              key={log.id}
              className="flex items-center gap-4 p-4 rounded-xl shadow-soft bg-white"
            >
              <img
                src={avatar}
                className="w-14 h-14 rounded-full object-cover"
                style={{
                  border: "3px solid #27AE60",
                }}
              />

              <div className="flex-1">
                <div className="font-bold text-gray-800 text-lg">{name}</div>

                <div className="text-sm text-gray-600 mt-1">
                  {new Date(log.created_at).toLocaleString()}
                </div>

                <div className="text-green-600 text-sm font-semibold mt-2">
                  🟢 元気です
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
