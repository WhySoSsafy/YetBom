import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { Icon } from '../components/Icon'

export function Analyzing() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  useEffect(() => {
    const id = setTimeout(() => nav('/identify'), 2100)
    return () => clearTimeout(id)
  }, [nav])
  const rows = [
    { label: t.analyzingImg, state: 'done' },
    { label: t.analyzingOcr, state: 'active' },
    { label: t.analyzingMatch, state: 'wait' },
  ]
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-white"
         style={{ background: 'linear-gradient(160deg, #2a1840, #0c0d12)' }}>
      <div className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-dbspin" />
      <h2 className="mt-8 text-[20px] font-bold">{t.analyzingTitle}</h2>
      <div className="mt-6 space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-[14px]">
            <span className={r.state === 'active' ? 'animate-dbpulse' : ''}>
              {r.state === 'done' ? <Icon name="check" size={16} /> : <span className="w-2 h-2 rounded-full bg-white/60 inline-block" />}
            </span>
            <span className={r.state === 'wait' ? 'text-white/40' : ''}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
