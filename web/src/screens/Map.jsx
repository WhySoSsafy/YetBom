import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { heritages } from '../data/heritage'
import { BottomSheet } from '../components/BottomSheet'
import { Icon } from '../components/Icon'

// 기존 핀 디자인(회전 물방울)을 Leaflet divIcon으로 재현 — 마커 이미지 에셋 의존 제거
function pinIcon(available) {
  const color = available ? '#9A5ABF' : 'rgba(0,0,0,.45)'
  return L.divIcon({
    className: 'yb-pin',
    html: `<span style="display:block;width:26px;height:26px;transform:rotate(45deg);border-radius:9999px;border-bottom-left-radius:0;background:${color};box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  })
}

// 모든 핀이 화면에 들어오도록 경계 맞춤(하단 시트 영역만큼 아래 여백 확보)
function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points.length) return
    map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [40, 90], paddingBottomRight: [40, 200] })
  }, [map, points])
  return null
}

export function MapScreen() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const mapSheet = useAppStore((s) => s.mapSheet)
  const setMapSheet = useAppStore((s) => s.setMapSheet)
  const t = copy[lang]
  const toggle = () => setMapSheet(mapSheet === 'collapsed' ? 'expanded' : 'collapsed')
  const open = (h) => nav(h.supported ? `/detail/${h.id}` : '/unsupported')
  const points = useMemo(() => heritages.map((h) => [h.lat, h.lng]), [])

  return (
    <div className="absolute inset-0">
      {/* z-0로 스택 컨텍스트를 만들어 Leaflet 내부 패널이 범례/시트 위로 새지 않게 한다 */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={[36.5, 127.8]} zoom={7} zoomControl={false} scrollWheelZoom
          style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitBounds points={points} />
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
        {heritages.map((h) => (
          <button key={h.id} onClick={() => open(h)} className="w-full flex items-center gap-3 py-3 text-left border-b border-black/5">
            <img src={h.thumb} alt="" className="w-[54px] h-[54px] rounded-card object-cover" />
            <div className="flex-1">
              <div className="font-semibold text-[15px]">{h.name[lang]}</div>
              <div className="text-[12px] text-black/50">{h.distance} · {h.status === 'available' ? t.mapLegendAvailable : t.mapLegendSoon}</div>
            </div>
            <Icon name="chevron-right" size={18} />
          </button>
        ))}
      </BottomSheet>
    </div>
  )
}
