import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

function pinIcon() {
  return L.divIcon({
    className: '',
    html: '<svg width="30" height="38" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.37 18.63 0 12 0z" fill="#9A5ABF"/><circle cx="12" cy="12" r="4.4" fill="#fff"/></svg>',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
  })
}
function Locate({ onUser }) {
  const map = useMap()
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { const ll = [pos.coords.latitude, pos.coords.longitude]; onUser?.(ll); map.setView?.(ll, 11, { animate: true }) },
        () => {}, { timeout: 8000 },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])
  return null
}

function Cluster({ items, onSelect }) {
  const map = useMap()
  useEffect(() => {
    if (!map.addLayer || !L.markerClusterGroup) return
    const group = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50 })
    items.forEach((h) => {
      if (h.lat == null || h.lng == null) return
      const m = L.marker([h.lat, h.lng], { icon: pinIcon() })
      m.on('click', () => onSelect?.(h))
      group.addLayer(m)
    })
    map.addLayer(group)
    return () => { map.removeLayer(group) }
  }, [map, items, onSelect])
  return null
}

// 좌표로 지도를 이동(목록/외부에서 선택했을 때)
function FlyTo({ target }) {
  const map = useMap()
  useEffect(() => {
    if (target && map.setView) map.setView([target.lat, target.lng], Math.max(map.getZoom?.() || 7, 13), { animate: true })
  }, [map, target])
  return null
}

export function HeritageMap({ items, onSelect, flyTo, onUser, className = '' }) {
  return (
    <div className={className}>
      <MapContainer center={[36.3, 127.8]} zoom={7} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Locate onUser={onUser} />
        <Cluster items={items} onSelect={onSelect} />
        <FlyTo target={flyTo} />
      </MapContainer>
    </div>
  )
}
