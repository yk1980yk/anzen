"use client";

export default function AnzenLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 opacity-90">
      <div className="loader-circle mb-4"></div>
      <p className="text-gray-600 font-medium">読み込み中…</p>
    </div>
  );
}
