'use client'

import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Leaflet のアイコン修正
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})
L.Marker.prototype.options.icon = DefaultIcon

export default function MapView({ latitude, longitude, radius }) {
  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full rounded"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={[latitude, longitude]} />

        <Circle
          center={[latitude, longitude]}
          radius={radius}
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }}
        />
      </MapContainer>
    </div>
  )
}
