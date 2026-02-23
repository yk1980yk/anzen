"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import * as turf from "@turf/turf";

let L: any = null;

// Leaflet components
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);

import MapClickHandler from "./MapClickHandler";

// ★ OSRM（無料）で道路ルート＋曲がり角案内を取得
async function fetchRoadRoute(start: [number, number], end: [number, number]) {
  const url = `https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) return null;

  const route = data.routes[0];

  return {
    coords: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [
      lat,
      lng,
    ]),
    steps: route.legs[0].steps,
  };
}

// ★ 曲がり角案内を日本語に変換
function formatInstruction(step: any) {
  const m = step.maneuver;

  if (m.type === "arrive") return "目的地に到着";

  if (m.type === "turn") {
    if (m.modifier === "right") return "右折";
    if (m.modifier === "left") return "左折";
    if (m.modifier === "straight") return "直進";
  }

  return "道なりに進む";
}

// ★ 音声案内（SpeechSynthesis）
function speak(text: string) {
  const uttr = new SpeechSynthesisUtterance(text);
  uttr.lang = "ja-JP";
  uttr.rate = 1.0;
  uttr.pitch = 1.0;
  speechSynthesis.speak(uttr);
}

export default function ScoutPage() {
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [targetPos, setTargetPos] = useState<[number, number] | null>(null);

  const [heading, setHeading] = useState(0);
  const [bearingToTarget, setBearingToTarget] = useState<number | null>(null);

  // ★ ③仕様：距離を2種類に分ける
  const [nextStepDistance, setNextStepDistance] = useState<number | null>(null);
  const [totalDistance, setTotalDistance] = useState<number | null>(null);

  const [routeLine, setRouteLine] = useState<[number, number][]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [nextInstruction, setNextInstruction] = useState<string | null>(null);

  const [mapInstance, setMapInstance] = useState<any>(null);

  const [navigating, setNavigating] = useState(false);
  const [arrived, setArrived] = useState(false);

  const [leafletReady, setLeafletReady] = useState(false);

  // ★ 音声案内 ON/OFF
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // ★ バッテリー節約モード
  const [powerSave, setPowerSave] = useState(false);

  // ★ 再検索用（ルート外れ検知）
  const [lastRerouteTime, setLastRerouteTime] = useState(0);

  // ★ 昼夜切り替え
  const [isNight, setIsNight] = useState(false);
  useEffect(() => {
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 6);
  }, []);

  // Leaflet 読み込み
  useEffect(() => {
    (async () => {
      const leaflet = await import("leaflet");
      L = leaflet.default;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "/marker-icon.png",
        iconRetinaUrl: "/marker-icon-2x.png",
        shadowUrl: "/marker-shadow.png",
      });

      setLeafletReady(true);
    })();
  }, []);

  // ★★★ Service Worker 登録（オフライン地図）★★★
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw-map.js")
      .catch((err) => console.error("SW registration failed", err));
  }, []);

  // ★ 現在地（節電モード対応）
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.error(err),
      {
        enableHighAccuracy: !powerSave,
        maximumAge: powerSave ? 5000 : 0,
        timeout: powerSave ? 10000 : 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [powerSave]);

  // コンパス
  useEffect(() => {
    const handler = (e: any) => {
      let h = 0;
      if (e.webkitCompassHeading) h = e.webkitCompassHeading;
      else if (e.alpha) h = 360 - e.alpha;
      setHeading(h);
    };
    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);

  // ★ 目的地までの距離（totalDistance）
  useEffect(() => {
    if (!currentPos || !targetPos) return;

    const from = turf.point([currentPos[1], currentPos[0]]);
    const to = turf.point([targetPos[1], targetPos[0]]);
    const dist = turf.distance(from, to, { units: "meters" });

    setTotalDistance(dist);

    const bearing = turf.bearing(from, to);
    setBearingToTarget(bearing);
  }, [currentPos, targetPos]);

  // ★ 次の案内までの距離（nextStepDistance）
  useEffect(() => {
    if (!currentPos || steps.length === 0) {
      setNextStepDistance(null);
      return;
    }

    const stepLoc = steps[0].maneuver.location; // [lng, lat]

    const dist = turf.distance(
      turf.point([currentPos[1], currentPos[0]]),
      turf.point(stepLoc),
      { units: "meters" }
    );

    setNextStepDistance(dist);
  }, [currentPos, steps]);

  // ★ 曲がり角案内の更新
  useEffect(() => {
    if (!currentPos || steps.length === 0) return;

    const nextStep = steps[0];
    const stepLoc = nextStep.maneuver.location;

    const dist = turf.distance(
      turf.point([currentPos[1], currentPos[0]]),
      turf.point(stepLoc),
      { units: "meters" }
    );

    if (dist < 12) {
      const newSteps = [...steps];
      newSteps.shift();

      setSteps(newSteps);
      setNextInstruction(
        newSteps[0] ? formatInstruction(newSteps[0]) : "目的地に到着"
      );
    }
  }, [currentPos, steps]);

  // ★ 音声案内（nextInstruction が変わったら）
  useEffect(() => {
    if (voiceEnabled && nextInstruction && navigating) {
      speak(nextInstruction);
    }
  }, [nextInstruction, navigating, voiceEnabled]);

  // ★ ナビ開始時の音声案内
  useEffect(() => {
    if (voiceEnabled && navigating && nextInstruction) {
      speak("ナビを開始します");
      speak("次、" + nextInstruction);
    }
  }, [navigating, voiceEnabled, nextInstruction]);

  // ★ 追尾
  useEffect(() => {
    if (mapInstance && currentPos && navigating) {
      mapInstance.setView(currentPos, 18);
    }
  }, [mapInstance, currentPos, navigating]);

  // ★ 到着判定
  useEffect(() => {
    if (totalDistance !== null && totalDistance < 10 && navigating) {
      setArrived(true);
      setNavigating(false);
      if (navigator.vibrate) navigator.vibrate(300);

      if (voiceEnabled) speak("目的地に到着しました");
    }
  }, [totalDistance, navigating, voiceEnabled]);

  // ★★★ ルート外れ検知 & 自動再検索 ★★★
  useEffect(() => {
    if (!navigating) return;
    if (!currentPos || routeLine.length < 2) return;

    const now = Date.now();

    if (now - lastRerouteTime < 5000) return;

    const pt = turf.point([currentPos[1], currentPos[0]]);
    const line = turf.lineString(
      routeLine.map(([lat, lng]) => [lng, lat])
    );

    const dist = turf.pointToLineDistance(pt, line, { units: "meters" });

    if (dist > 30 && targetPos) {
      console.log("ルート外れ → 再検索");
      setLastRerouteTime(now);

      (async () => {
        const result = await fetchRoadRoute(currentPos, targetPos);

        if (result) {
          setRouteLine(result.coords);
          setSteps(result.steps);
          setNextInstruction(
            result.steps[0]
              ? formatInstruction(result.steps[0])
              : "目的地に到着"
          );
        } else {
          setRouteLine([
            [currentPos[0], currentPos[1]],
            [targetPos[0], targetPos[1]],
          ]);
          setSteps([]);
          setNextInstruction(null);
        }
      })();
    }
  }, [currentPos, navigating, routeLine, targetPos, lastRerouteTime]);

  // ★ Leaflet準備中
  if (!leafletReady) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
        }}
      >
        Loading...
      </div>
    );
  }

  // ★ 3Dコンパス用の角度
  const compassAngle =
    bearingToTarget !== null
      ? (bearingToTarget - heading + 360) % 360
      : 0;

  const centerPos = currentPos ?? [35.681236, 139.767125];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        background: isNight ? "#121212" : "#ffffff",
        filter: powerSave ? "brightness(0.7)" : "none",
      }}
    >
      <MapContainer
        center={centerPos}
        zoom={16}
        style={{ width: "100%", height: "100%" }}
        whenCreated={(map) => setMapInstance(map)}
      >
        <TileLayer
          url={
            isNight
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        />

        <MapClickHandler
          onSelect={async (lat, lng) => {
            setTargetPos([lat, lng]);
            setArrived(false);
            setNavigating(false);

            if (currentPos) {
              const result = await fetchRoadRoute(currentPos, [lat, lng]);

              if (result) {
                setRouteLine(result.coords);
                setSteps(result.steps);
                setNextInstruction(
                  result.steps[0]
                    ? formatInstruction(result.steps[0])
                    : "目的地に到着"
                );
              } else {
                setRouteLine([
                  [currentPos[0], currentPos[1]],
                  [lat, lng],
                ]);
                setSteps([]);
                setNextInstruction(null);
              }
            }
          }}
        />

        {currentPos && (
          <CircleMarker
            center={currentPos}
            radius={10}
            pathOptions={{
              color: "#FFFFFF",
              weight: 3,
              fillColor: "#3B82F6",
              fillOpacity: 1.0,
            }}
          />
        )}

        {targetPos && (
          <CircleMarker
            center={targetPos}
            radius={10}
            pathOptions={{
              color: "#FFFFFF",
              weight: 3,
              fillColor: "#FF4D4D",
              fillOpacity: 1.0,
            }}
          />
        )}

        {routeLine.length > 0 && (
          <>
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: "rgba(59,130,246,0.4)",
                weight: navigating ? 12 : 10,
                opacity: 0.7,
              }}
            />
            <Polyline
              positions={routeLine}
              pathOptions={{
                color: "#3B82F6",
                weight: navigating ? 6 : 4,
                opacity: navigating ? 1.0 : 0.9,
              }}
            />
          </>
        )}
      </MapContainer>

      {/* ナビ中バー */}
      {navigating && (
        <div
          style={{
            position: "absolute",
            top: 0,
            width: "100%",
            padding: "16px 0",
            background: "rgba(0,0,0,0.85)",
            color: "#FFFFFF",
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
            textShadow: "0 0 10px rgba(0,0,0,1)",
            zIndex: 5000,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span>ナビ中</span>

          {bearingToTarget !== null && (
            <span style={{ fontSize: "18px" }}>
              {(() => {
                const d = (bearingToTarget + 360) % 360;
                if (d < 45 || d >= 315) return "北へ進む";
                if (d < 135) return "東へ進む";
                if (d < 225) return "南へ進む";
                return "西へ進む";
              })()}
            </span>
          )}
        </div>
      )}

      {/* 曲がり角案内 */}
      {navigating && nextInstruction && (
        <div
          style={{
            position: "absolute",
            top: "130px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.9)",
            color: "white",
            padding: "12px 20px",
            borderRadius: "10px",
            fontSize: "22px",
            fontWeight: "bold",
            textShadow: "0 0 10px rgba(0,0,0,1)",
            zIndex: 5000,
          }}
        >
          次：{nextInstruction}
        </div>
      )}

      {/* 3Dコンパス */}
      {navigating && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "50%",
            transform: `translateX(-50%) rotate(${compassAngle}deg)`,
            width: "130px",
            height: "130px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 5000,
            perspective: "800px",
            transition: "transform 0.25s ease-out",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.25)",
              boxShadow: "0 0 12px rgba(255,255,255,0.2)",
            }}
          ></div>

          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "28px solid transparent",
              borderRight: "28px solid transparent",
              borderBottom: "70px solid #FFFFFF",
              transform: "rotateX(25deg)",
              filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.9))",
            }}
          ></div>

         <div
  style={{
    position: "absolute",
    top: "25px",
    width: "6px",
    height: "55px",
    background: "rgba(255,255,255,0.9)",
    borderRadius: "3px",
    boxShadow: "0 0 6px rgba(255,255,255,0.8)",
  }}
></div>
        </div>
      )}

      {/* 距離（情報） ③仕様：2段表示 */}
      {targetPos && (
        <div
          style={{
            position: "absolute",
            bottom: "240px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.75)",
            color: "#EDEDED",
            padding: "14px 26px",
            borderRadius: "14px",
            fontSize: "20px",
            fontWeight: "bold",
            border: "1px solid rgba(255,255,255,0.4)",
            zIndex: 5000,
            textAlign: "center",
            lineHeight: "1.6",
          }}
        >
          {nextStepDistance !== null && (
            <div>次の案内まで {Math.round(nextStepDistance)}m</div>
          )}

          {totalDistance !== null && (
            <div>目的地まで {Math.round(totalDistance)}m</div>
          )}
        </div>
      )}

      {/* ナビ開始（主要操作） */}
      {targetPos && !navigating && !arrived && (
        <button
          onClick={() => setNavigating(true)}
          style={{
            position: "absolute",
            bottom: "180px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.85)",
            color: "#EDEDED",
            padding: "14px 40px",
            borderRadius: "30px",
            fontSize: "20px",
            fontWeight: "bold",
            border: "1px solid rgba(255,255,255,0.4)",
            zIndex: 5000,
          }}
        >
          ナビ開始
        </button>
      )}

      {/* 音声案内（補助） */}
      <div
        style={{
          position: "absolute",
          bottom: "130px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.6)",
          padding: "10px 16px",
          borderRadius: "10px",
          color: "white",
          zIndex: 5000,
          fontSize: "16px",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={(e) => setVoiceEnabled(e.target.checked)}
          />
          音声案内
        </label>
      </div>

      {/* バッテリー節約（補助） */}
      <div
        style={{
          position: "absolute",
          bottom: "90px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0,0,0,0.6)",
          padding: "10px 16px",
          borderRadius: "10px",
          color: "white",
          zIndex: 5000,
          fontSize: "16px",
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={powerSave}
            onChange={(e) => setPowerSave(e.target.checked)}
          />
          バッテリー節約
        </label>
      </div>

      {/* 到着 */}
      {arrived && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            color: "#EDEDED",
            padding: "20px 30px",
            borderRadius: "12px",
            fontSize: "24px",
            zIndex: 9999,
          }}
        >
          到着しました
        </div>
      )}

      {/* SOS（最重要・最下部固定） */}
      <a
        href="tel:110"
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "red",
          color: "white",
          padding: "18px 50px",
          borderRadius: "35px",
          fontSize: "22px",
          fontWeight: "bold",
          textDecoration: "none",
          zIndex: 5000,
        }}
      >
        SOS
      </a>
    </div>
  );
}
