"use client";

import { useRouter } from "next/navigation";

export default function RescueHome() {
  const router = useRouter();

  // 統一デザインのカード
  const Card = ({
    icon,
    title,
    description,
    color,
    onClick,
  }: {
    icon: string;
    title: string;
    description: string;
    color: string;
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className="w-full p-5 rounded-xl shadow-md cursor-pointer transition-transform hover:scale-[1.02] bg-white flex items-center space-x-4"
      style={{
        borderLeft: `10px solid ${color}`,
      }}
    >
      <span className="text-3xl">{icon}</span>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-4">救助要請モード</h1>

      {/* 🔥 災害SOS（赤） */}
      <Card
        icon="🔥"
        title="災害SOS"
        description="地震・火災・洪水など、動けない状況で救助を要請"
        color="#FF4D4D"
        onClick={() => router.push("/rescue/disaster")}
      />

      {/* 👵 高齢者SOS（ANZENブルー） */}
      <Card
        icon="👵"
        title="高齢者SOS"
        description="自宅で動けない・体調不良など、緊急時に救助を要請"
        color="#1E90FF"
        onClick={() => router.push("/rescue/elderly")}
      />
    </div>
  );
}
