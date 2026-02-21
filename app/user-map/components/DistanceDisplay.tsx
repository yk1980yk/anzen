"use client";

import { getDistance } from "./getDistance";

export default function DistanceDisplay({
  userLat,
  userLng,
  targetLat,
  targetLng,
}: {
  userLat: number;
  userLng: number;
  targetLat: number;
  targetLng: number;
}) {
  const distance = getDistance(userLat, userLng, targetLat, targetLng);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-xl shadow-lg text-center">
      <p className="text-lg font-bold">
        目的地まで {Math.round(distance)} m
      </p>
    </div>
  );
}
