// ANZEN マップ共通スタイル & マーカー完全版
// --------------------------------------------------

import L from "leaflet";

// ===============================
// ★ マップ全体のスタイル
// ===============================
export const anzenMapStyle = {
  height: "100dvh",
  width: "100%",
  background: "#f0f0f0", // ローディング時の優しい背景
};

// ===============================
// ★ ポップアップの共通スタイル
// ===============================
export const popupStyle: React.CSSProperties = {
  borderRadius: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  padding: "10px",
  background: "white",
};

// ===============================
// ★ プロフィール画像の共通スタイル
// ===============================
export const avatarStyle = (borderColor: string): React.CSSProperties => ({
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  border: `3px solid ${borderColor}`,
  objectFit: "cover",
  marginBottom: "8px",
});

// ===============================
// ★ 現在地マーカー（ANZENブルー）
// ===============================
export const currentLocationIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:18px;
    height:18px;
    background:#1976D2;
    border-radius:50%;
    border:3px solid white;
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ===============================
// ★ 災害SOSマーカー（赤・点滅）
// ===============================
export const sosIcon = L.divIcon({
  className: "",
  html: `<div class="anzen-sos-blink" style="
    width:26px;
    height:26px;
    background:#E53935;
    border-radius:50%;
    border:3px solid white;
  "></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

// ===============================
// ★ 高齢者SOSマーカー（オレンジ・ゆっくり点滅）
// ===============================
export const elderlySOSIcon = L.divIcon({
  className: "",
  html: `<div class="anzen-elderly-blink" style="
    width:28px;
    height:28px;
    background:#F5A623;
    border-radius:50%;
    border:3px solid white;
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// ===============================
// ★ 点滅アニメーション（CSS）
// ※ グローバルCSSに追加する必要あり
// ===============================
export const anzenBlinkCSS = `
@keyframes sosBlink {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes elderlyBlink {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.92); }
  100% { opacity: 1; transform: scale(1); }
}

.anzen-sos-blink {
  animation: sosBlink 1.2s infinite;
}

.anzen-elderly-blink {
  animation: elderlyBlink 1.4s infinite;
}
`;
