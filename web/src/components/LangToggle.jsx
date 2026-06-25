import { useAppStore } from '../store/useAppStore'

export function LangToggle({ variant = 'pill' }) {
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  const opts = [{ key: 'ko', label: '한국어' }, { key: 'en', label: 'EN' }]
  return (
    <div className="flex gap-[6px]">
      {opts.map((o) => (
        <button key={o.key} onClick={() => setLang(o.key)}
          className={`px-3 py-1 rounded-full text-[13px] font-medium transition-colors ${
            lang === o.key ? 'bg-primary text-white' : 'bg-black/5 text-black/60'
          }`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
