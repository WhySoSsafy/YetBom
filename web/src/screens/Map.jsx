import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { useAppStore } from '../store/useAppStore'
import { copy, tr } from '../data/copy'
import { useHeritages } from '../data/useHeritages'
import { BottomSheet } from '../components/BottomSheet'
import { Thumb } from '../components/Thumb'
import { Icon } from '../components/Icon'

// 정확히 아래를 가리키는 물방울 핀(SVG)
function pinIcon(available) {
  const color = available ? '#9A5ABF' : '#9CA3AF'
  return L.divIcon({
    className: '',
    html: `<svg width="30" height="38" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.37 18.63 0 12 0z" fill="${color}"/><circle cx="12" cy="12" r="4.4" fill="#fff"/></svg>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
  })
}

const userIcon = () => L.divIcon({
  className: '',
  html: '<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 3px rgba(37,99,235,.35)"></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function distKm(a, b) {
  const R = 6371, toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b[0] - a[0]), dLng = toRad(b[1] - a[1])
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}
const fmtDist = (d) => (d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`)

// 진입 시 내 위치로 확대. 거부/불가 시 한국 전역.
function MapInit({ onUser }) {
  const map = useMap()
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { const ll = [pos.coords.latitude, pos.coords.longitude]; onUser(ll); map.setView?.(ll, 12, { animate: true }) },
        () => {},
        { timeout: 8000, enableHighAccuracy: true },
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])
  return null
}

// 수백 개 핀을 클러스터링으로 렌더(성능)
function ClusterLayer({ items, onOpen }) {
  const map = useMap()
  useEffect(() => {
    if (!map.addLayer || !L.markerClusterGroup) return // 테스트 스텁 가드
    const group = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50 })
    items.forEach((h) => {
      if (h.lat == null || h.lng == null) return
      const m = L.marker([h.lat, h.lng], { icon: pinIcon(!h.dynamic || h.status === 'available') })
      m.on('click', () => onOpen(h))
      group.addLayer(m)
    })
    map.addLayer(group)
    return () => { map.removeLayer(group) }
  }, [map, items, onOpen])
  return null
}

export function MapScreen() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const mapSheet = useAppStore((s) => s.mapSheet)
  const setMapSheet = useAppStore((s) => s.setMapSheet)
  const [userPos, setUserPos] = useState(null)
  const { list, loading } = useHeritages(lang)
  const t = copy[lang] || copy.en
  // 지도 탭 진입 시 바텀시트를 펼친 상태로(주변 목록이 바로 보이게)
  useEffect(() => { setMapSheet('expanded') }, [setMapSheet])
  const toggle = () => setMapSheet(mapSheet === 'collapsed' ? 'expanded' : 'collapsed')
  const open = (h) => nav(h.supported === false ? '/unsupported' : `/detail/${h.id}`)

  // 시트 목록: 내 위치 있으면 가까운 순 상위 60곳, 없으면 큐레이션 우선 60곳
  const sheetList = useMemo(() => {
    const arr = userPos
      ? list.map((h) => ({ ...h, _d: distKm(userPos, [h.lat, h.lng]) })).sort((a, b) => a._d - b._d)
      : list
    return arr.slice(0, 60).map((h) => ({ ...h, dist: h._d != null ? fmtDist(h._d) : (h.distance || '') }))
  }, [list, userPos])

  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 z-0">
        <MapContainer center={[36.5, 127.8]} zoom={7} zoomControl={false} scrollWheelZoom
          style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapInit onUser={setUserPos} />
          {userPos && <Marker position={userPos} icon={userIcon()} />}
          <ClusterLayer items={list} onOpen={open} />
        </MapContainer>
      </div>

      <div className="absolute top-16 left-4 z-10 pointer-events-none">
        <span className="px-3 py-1 rounded-full bg-white/90 text-[12px] shadow-sm">
          {loading ? '…' : `${list.length}`} · {t.mapNearby}
        </span>
      </div>

      <BottomSheet open state={mapSheet} collapsedH={150} expandedH={402} onToggle={toggle}
        title={`${t.mapNearby} · ${list.length}`}>
        {sheetList.map((h) => (
          <button key={h.id} onClick={() => open(h)} className="w-full flex items-center gap-3 py-3 text-left border-b border-black/5">
            <Thumb src={h.thumb || h.image} label={tr(h.name, lang)} className="w-[54px] h-[54px] rounded-card object-cover shrink-0 text-[18px]" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[15px] truncate">{tr(h.name, lang)}</div>
              <div className="text-[12px] text-black/50 truncate">{h.dist || tr(h.era, lang)}</div>
            </div>
            <Icon name="chevron-right" size={18} />
          </button>
        ))}
      </BottomSheet>
    </div>
  )
}
