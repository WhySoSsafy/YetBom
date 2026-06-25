import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { heritages } from '../data/heritage'
import { BottomSheet } from '../components/BottomSheet'
import { Icon } from '../components/Icon'

export function MapScreen() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const mapSheet = useAppStore((s) => s.mapSheet)
  const setMapSheet = useAppStore((s) => s.setMapSheet)
  const t = copy[lang]
  const toggle = () => setMapSheet(mapSheet === 'collapsed' ? 'expanded' : 'collapsed')
  const open = (h) => nav(h.supported ? `/detail/${h.id}` : '/unsupported')
  // 핀 위치는 데모용 고정 좌표 매핑
  const pinPos = [{ top: '38%', left: '44%' }, { top: '30%', left: '52%' }, { top: '60%', left: '35%' }, { top: '66%', left: '60%' }]

  return (
    <div className="absolute inset-0">
      <img src="/img/map_bg.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute top-16 left-4 flex gap-2 z-10">
        <span className="px-3 py-1 rounded-full bg-white/90 text-[12px] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" />{t.mapLegendAvailable}</span>
        <span className="px-3 py-1 rounded-full bg-white/90 text-[12px] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-black/40" />{t.mapLegendSoon}</span>
      </div>
      {heritages.map((h, i) => (
        <button key={h.id} onClick={() => open(h)} style={pinPos[i]}
          className="absolute -translate-x-1/2 -translate-y-full">
          <span className={`block w-7 h-7 rotate-45 rounded-full rounded-bl-none ${h.status === 'available' ? 'bg-primary' : 'bg-black/40'} flex items-center justify-center`}>
            <span className="-rotate-45 text-white"><Icon name="location" size={14} /></span>
          </span>
        </button>
      ))}
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
