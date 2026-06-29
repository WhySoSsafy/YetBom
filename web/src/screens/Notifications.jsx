import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy, tr } from '../data/copy'
import { Switch } from '../components/Switch'
import { Icon } from '../components/Icon'

export function Notifications() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const noti = useAppStore((s) => s.noti)
  const setNoti = useAppStore((s) => s.setNoti)
  const t = copy[lang]
  const rows = [
    { key: 'ads', icon: 'sparkle', label: { ko: '야간개장·행사', en: 'Night events' }, desc: { ko: '야간개장과 행사 소식', en: 'Night openings & events' } },
    { key: 'today', icon: 'home', label: { ko: '오늘의 문화유산', en: "Today's heritage" }, desc: { ko: '매일 새로운 문화유산', en: 'A new heritage daily' } },
    { key: 'newRestore', icon: 'layers', label: { ko: '신규 복원 공개', en: 'New restorations' }, desc: { ko: '복원 사례가 추가되면', en: 'When restorations are added' } },
    { key: 'nearby', icon: 'location', label: { ko: '주변 문화유산 추천', en: 'Nearby heritage' }, desc: { ko: '근처 문화유산 알림', en: 'Heritage near you' } },
  ]
  return (
    <div className="absolute inset-0 overflow-y-auto nsb px-content pt-16 pb-8">
      <button onClick={() => nav(-1)} className="mb-4"><Icon name="chevron-left" size={24} /></button>
      <h1 className="text-[22px] font-bold">{t.notiTitle}</h1>
      <div className="mt-6 space-y-4">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon name={r.icon} size={20} /></div>
            <div className="flex-1">
              <div className="font-semibold text-[15px]">{tr(r.label, lang)}</div>
              <div className="text-[12px] text-black/50">{tr(r.desc, lang)}</div>
            </div>
            <Switch on={noti[r.key]} onChange={(v) => setNoti(r.key, v)} />
          </div>
        ))}
      </div>
    </div>
  )
}
