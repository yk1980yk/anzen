"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import Link from "next/link";

export default function DisasterHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [familyList, setFamilyList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 公開範囲の日本語ラベル
  const visibilityLabelMap: any = {
    all: "全ユーザー",
    nearby: "近くのユーザー",
    family_nearby: "家族＋近くのユーザー",
    family_only: "家族のみ",
  };

  /* ============================================
     ★ 家族一覧を取得
  ============================================ */
  useEffect(() => {
    const fetchFamily = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("family_links")
        .select("family_user_id")
        .eq("user_id", user.id)
        .eq("status", "approved");

      if (data) {
        setFamilyList(data.map((f) => f.family_user_id));
      }
    };

    fetchFamily();
  }, []);

  /* ============================================
     ★ 自分＋家族のSOS履歴を取得
  ============================================ */
  useEffect(() => {
    const fetchLogs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 自分 or 家族のSOS
      const { data } = await supabase
        .from("disaster_sos")
        .select(
          `
          *,
          profiles!disaster_sos_user_id_fkey (
            name,
            avatar_url,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (!data) return;

      // 自分 or 家族のものだけに絞る
      const filtered = data.filter((log) => {
        return log.user_id === user.id || familyList.includes(log.user_id);
      });

      setLogs(filtered);
      setLoading(false);
    };

    fetchLogs();
  }, [familyList]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader-circle"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-20">
      <Header title="SOS履歴" />

      {logs.length === 0 && (
        <p className="text-center text-gray-600 mt-10">
          SOS履歴がありません
        </p>
      )}

      <div className="mt-4 space-y-4">
        {logs.map((log) => {
          const name =
            log.profiles?.name ||
            log.profiles?.email ||
            log.user_id.substring(0, 8);

          const avatar =
            log.profiles?.avatar_url ||
            "https://cdn-icons-png.flaticon.com/512/847/847969.png";

          const isFamily = familyList.includes(log.user_id);

          return (
            <div
              key={log.id}
              className="anzen-card flex items-center gap-4 shadow-soft"
            >
              {/* アイコン */}
              <img
                src={avatar}
                className="w-14 h-14 rounded-full object-cover"
                style={{
                  border: isFamily ? "3px solid #2563EB" : "2px solid #ddd",
                }}
              />

              <div className="flex-1">
                <div className="font-bold text-gray-800 flex items-center gap-2">
                  {name}
                  {isFamily && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      家族
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  {new Date(log.created_at).toLocaleString()}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  公開範囲：{visibilityLabelMap[log.visibility]}
                </div>

                {/* マップで開く */}
                <Link
                  href={`/map?lat=${log.lat}&lng=${log.lng}`}
                  className="text-blue-600 text-sm font-semibold mt-2 inline-block"
                >
                  📍 マップで開く
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
