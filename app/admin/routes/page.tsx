"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Route = {
  id: string;
  user_id: string;
  title: string | null;
  created_at: string;
};

export default function RouteListPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    const { data, error } = await supabase
      .from("routes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRoutes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 space-y-6">
      <h1 className="text-3xl font-bold">📍 記録されたルート一覧</h1>

      {loading && (
        <p className="text-gray-500">読み込み中...</p>
      )}

      {!loading && routes.length === 0 && (
        <p className="text-gray-500">まだルートが記録されていません</p>
      )}

      <div className="flex flex-col gap-4">
        {routes.map((route) => (
          <Link
            key={route.id}
            href={`/route-playback?route_id=${route.id}`}
          >
            <div className="p-5 bg-white rounded-soft shadow-soft border border-gray-200 cursor-pointer hover:bg-blue-50 transition">
              <p className="text-lg font-bold">🛣 {route.title ?? "無題のルート"}</p>
              <p className="text-sm text-gray-500 mt-1">
                🕒 {new Date(route.created_at).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
