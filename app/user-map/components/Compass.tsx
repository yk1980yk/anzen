"use client";

import { useEffect, useState } from "react";

export default function Compass() {
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    const handleOrientation = (event: any) => {
      let compassHeading;

      // iPhone（webkitCompassHeading がある）
      if (event.webkitCompassHeading) {
        compassHeading = event.webkitCompassHeading;
      } else {
        // Android（alpha を使う）
        compassHeading = 360 - event.alpha;
      }

      setHeading(compassHeading);
    };

    window.addEventListener("deviceorientation", handleOrientation, true);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 bg-white p-4 rounded-xl shadow-lg text-center">
      <p className="text-sm text-gray-600">方位</p>
      <p className="text-2xl font-bold">{heading ? `${Math.round(heading)}°` : "取得中..."}</p>
    </div>
  );
}
