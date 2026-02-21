// /lib/cityCategory.ts

// 大都市（揺れ幅最小）
export const LARGE_CITIES = [
  "東京", "大阪", "名古屋", "横浜", "札幌", "福岡",
  "川崎", "神戸", "京都"
];

// 政令指定都市（揺れ幅中）
export const MID_CITIES = [
  "仙台", "広島", "さいたま", "千葉", "静岡", "浜松",
  "新潟", "熊本", "岡山", "相模原", "堺", "北九州"
];

// 都市カテゴリー判定
export function getCityCategory(cityName?: string) {
  if (!cityName) return "rural";

  if (LARGE_CITIES.some(c => cityName.includes(c))) return "largeCity";
  if (MID_CITIES.some(c => cityName.includes(c))) return "midCity";

  return "rural";
}
