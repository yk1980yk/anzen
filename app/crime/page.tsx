"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default function CrimeRedirect() {
  useEffect(() => {
    redirect("/dashboard");
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 px-4 pt-4">
      {/* ★ 共通ヘッダー */}
      <Header title="防犯モード" />

      <p className="text-gray-600 mt-4">防犯モードに移動しています...</p>
    </div>
  );
}
