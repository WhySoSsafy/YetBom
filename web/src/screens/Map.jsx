import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppStore } from '../store/useAppStore'
import { copy, tr } from '../data/copy'
import { heritages } from '../data/heritage'
import { BottomSheet } from '../components/BottomSheet'
import { Thumb } from '../components/Thumb'
import { Icon } from '../components/Icon'

// 정확히 아래를 가리키는 물방울 핀(SVG) — 회전 사각형의 방향 어긋남 제거
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

// 두 좌표 사이 거리(km) — Haversine
function distKm(a, b) {
  const R = 6371, toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b[0] - a[0]), dLng = toRad(b[1] - a[1])
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}
const fmtDist = (d) => (d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`)

// 진입 시 내 위치로 확대. 위치 거부/불가 시 전국 핀이 모두 보이도록 경계 맞춤.
function MapInit({ points, onUser }) {
  const map = useMap()
  useEffect(() => {
    const fitAll = () => points.length && map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [40, 90], paddingBottomRight: [40, 200] })
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { const ll = [pos.coords.latitude, pos.coords.longitude]; onUser(ll); map.setView(ll, 13, { animate: true }) },
        () => fitAll(),
        { timeout: 8000, enableHighAccuracy: true },
      )
    } else fitAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])
  return null
}

export function MapScreen() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const mapSheet = useAppStore((s) => s.mapSheet)
  const setMapSheet = useAppStore((s) => s.setMapSheet)
  const [userPos, setUserPos] = useState(null)
  const t = copy[lang]
  const toggle = () => setMapSheet(mapSheet === 'collapsed' ? 'expanded' : 'collapsed')
  const open = (h) => nav(h.supported ? `/detail/${h.id}` : '/unsupported')
  const points = useMemo(() => heritages.map((h) => [h.lat, h.lng]), [])

  // 내 위치가 있으면 실제 거리순 정렬 + 실제 거리 표기
  const list = useMemo(() => {
    if (!userPos) return heritages.map((h) => ({ ...h, dist: h.distance }))
    return heritages
      .map((h) => ({ ...h, _d: distKm(userPos, [h.lat, h.lng]) }))
      .sort((a, b) => a._d - b._d)
      .map((h) => ({ ...h, dist: fmtDist(h._d) }))
  }, [userPos])

  return (
    <div className="absolute inset-0">
      {/* z-0로 스택 컨텍스트를 만들어 Leaflet 내부 패널이 범례/시트 위로 새지 않게 한다 */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={[36.5, 127.8]} zoom={7} zoomControl={false} scrollWheelZoom
          style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapInit points={points} onUser={setUserPos} />
          {userPos && <Marker position={userPos} icon={userIcon()} />}
          {heritages.map((h) => (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={pinIcon(h.status === 'available')}
              eventHandlers={{ click: () => open(h) }} />
          ))}
        </MapContainer>
      </div>

      <div className="absolute top-16 left-4 flex gap-2 z-10 pointer-events-none">
        <span className="px-3 py-1 rounded-full bg-white/90 text-[12px] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />{t.mapLegendAvailable}</span>
        <span className="px-3 py-1 rounded-full bg-white/90 text-[12px] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-black/40" />{t.mapLegendSoon}</span>
      </div>

      <BottomSheet open state={mapSheet} collapsedH={150} expandedH={402} onToggle={toggle}
        title={`${t.mapNearby} · ${heritages.length}`}>
        {list.map((h) => (
          <button key={h.id} onClick={() => open(h)} className="w-full flex items-center gap-3 py-3 text-left border-b border-black/5">
            <Thumb src={h.thumb} label={tr(h.name, lang)} className="w-[54px] h-[54px] rounded-card object-cover shrink-0 text-[18px]" />
            <div className="flex-1">
              <div className="font-semibold text-[15px]">{tr(h.name, lang)}</div>
              <div className="text-[12px] text-black/50">{h.dist} · {h.status === 'available' ? t.mapLegendAvailable : t.mapLegendSoon}</div>
            </div>
            <Icon name="chevron-right" size={18} />
          </button>
        ))}
      </BottomSheet>
    </div>
  )
}
