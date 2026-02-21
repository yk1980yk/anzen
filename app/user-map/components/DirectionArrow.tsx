"use client";

import { useEffect, useState } from "react";
import { getBearing } from "./getBearing";

export default function DirectionArrow({
  userLat,
  userLng,
  targetLat,
  targetLng,
  heading,
}: {
  userLat: number;
  userLng: number;
  targetLat: number;
  targetLng: number;
  heading: number | null;
}) {
  const [arrowAngle, setArrowAngle] = useState(0);

  useEffect(() => {
    if (heading == null) return;

    const bearing = getBearing(userLat, userLng, targetLat, targetLng);

    // ユーザーが向くべき方向 = 目的地方向 - 北の方向
    const angle = bearing - heading;

    setArrowAngle(angle);
  }, [userLat, userLng, targetLat, targetLng, heading]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999]">
      <div
        className="w-20 h-20 flex items-center justify-center"
        style={{
          transform: `rotate(${arrowAngle}deg)`,
          transition: "transform 0.2s linear",
        }}
      >
        <span className="text-5xl">⬆️</span>
      </div>
    </div>
  );
}
