"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// MiniMap（ユーザー用）
const MiniMap = dynamic(() => import("../dashboard/danger-areas/MiniMap"), {
  ssr: false,
});

export default function MyPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 投稿取得（ログインユーザーのみ）
  useEffect(() => {
    const fetchPosts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("danger_areas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPosts(data || []);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="p-6">読み込み中...</p>;

  return (
    <div className="p-6 space-y-6 pb-20">

      <h1 className="text-2xl font-bold">マイページ</h1>

      {posts.length === 0 && (
        <p className="text-gray-600">まだ投稿がありません。</p>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="anzen-card">

            <div className="flex flex-col md:flex-row gap-4">

              {/* MiniMap */}
              <div className="w-full md:w-1/3">
                <MiniMap
                  latitude={post.latitude}
                  longitude={post.longitude}
                  radius={post.radius}
                  level={post.level}
                />
              </div>

              {/* 情報 */}
              <div className="flex-1 flex flex-col justify-between">

                <div>
                  <h2 className="text-xl font-bold">{post.title}</h2>
                  <p className="text-gray-700 mt-1">{post.description}</p>

                  <div className="mt-3 text-sm text-gray-800 space-y-1">
                    <p>レベル: {post.level}</p>
                    <p>範囲: {post.radius}m</p>
                    <p>緯度: {post.latitude}</p>
                    <p>経度: {post.longitude}</p>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    投稿日時: {new Date(post.created_at).toLocaleString()}
                  </p>

                  {post.display_time && (
                    <p className="text-xs text-gray-500">
                      表示時刻: {new Date(post.display_time).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* ボタン */}
                <div className="flex gap-4 mt-4">

                  <button
                    onClick={() =>
                      router.push(`/mypage/${post.id}/edit`)
                    }
                    className="anzen-btn-primary"
                  >
                    編集
                  </button>

                  <button
                    onClick={async () => {
                      if (!confirm("本当に削除しますか？")) return;

                      await supabase
                        .from("danger_areas")
                        .delete()
                        .eq("id", post.id);

                      setPosts(posts.filter((p) => p.id !== post.id));
                    }}
                    className="anzen-btn-danger"
                  >
                    削除
                  </button>

                </div>

              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
