"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  const pathname = usePathname();

  // ★ user-map 系ではヘッダーを透明にしてタッチを邪魔しない
  const isMapPage =
    pathname.startsWith("/user-map") ||
    pathname.startsWith("/sos-scout") ||
    pathname.startsWith("/crime") ||
    pathname.startsWith("/rescue");

  return (
    <div
      className={`
        w-full py-4 px-4 flex items-center justify-between fixed top-0 left-0
        ${isMapPage ? "pointer-events-none bg-transparent shadow-none z-0" : "bg-white shadow-md z-50"}
      `}
    >
      {/* 戻るボタン（地図ページでは触れないように pointer-events-none） */}
      <button
        onClick={() => router.back()}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow text-blue-500"
        style={{
          border: "2px solid #1E90FF",
          pointerEvents: isMapPage ? "none" : "auto",
        }}
      >
        ←
      </button>

      {/* タイトル */}
      <h1 className="text-lg font-bold">{title}</h1>

      {/* 設定アイコン */}
      <Link
        href="/settings"
        style={{ pointerEvents: isMapPage ? "none" : "auto" }}
      >
        <div className="w-10 h-10 flex items-center justify-center text-2xl active:scale-95">
          ⚙️
        </div>
      </Link>
    </div>
  );
}
