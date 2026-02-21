'use client';

import 'mapbox-gl/dist/mapbox-gl.css';   // ← ★これが絶対必要！！

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { createClient } from '@supabase/supabase-js';
import * as turf from '@turf/turf';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    console.log("🟦 MapView: 初期化開始");

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [139.6917, 35.6895],
      zoom: 12,
    });

    map.on("load", () => {
      console.log("🟩 Mapbox: load イベント発火");
    });

    // 現在地ボタン
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
      })
    );

    const loadDangerZones = async () => {
      console.log("🟦 Supabase: danger_zones 読み込み開始");

      const { data, error } = await supabase.from('danger_zones').select('*');

      if (error) {
        console.error("🟥 Supabase エラー:", error);
        return;
      }

      console.log("🟩 Supabase: 読み込み成功 →", data);

      map.on('load', () => {
        console.log("🟩 Mapbox: load 内で danger_zones 描画開始");

        data.forEach((zone, index) => {
          console.log(`🟦 ゾーン${index}:`, zone);

          // Turf.js で円生成（radius はメートル）
          const circle = turf.circle(
            [zone.longitude, zone.latitude],
            zone.radius,
            { steps: 64, units: 'meters' }
          );

          console.log(`🟩 Turf.js: 円生成成功（${zone.radius}m）`);

          const sourceId = `danger-zone-${index}`;
          const layerId = `danger-zone-layer-${index}`;

          try {
            map.addSource(sourceId, {
              type: 'geojson',
              data: circle,
            });
            console.log("🟩 Source 追加成功:", sourceId);
          } catch (e) {
            console.error("🟥 Source 追加失敗:", e);
          }

          try {
            map.addLayer({
              id: layerId,
              type: 'fill',
              source: sourceId,
              paint: {
                'fill-color':
                  zone.level === 3
                    ? 'rgba(255,0,0,0.3)'
                    : zone.level === 2
                    ? 'rgba(255,165,0,0.3)'
                    : 'rgba(255,255,0,0.3)',
                'fill-outline-color':
                  zone.level === 3
                    ? 'red'
                    : zone.level === 2
                    ? 'orange'
                    : 'yellow',
              },
            });
            console.log("🟩 Layer 追加成功:", layerId);
          } catch (e) {
            console.error("🟥 Layer 追加失敗:", e);
          }
        });
      });
    };

    loadDangerZones();

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
}
