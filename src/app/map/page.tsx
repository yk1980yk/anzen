'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
});

export default function UserMapPage() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <MapView />
    </div>
  );
}
