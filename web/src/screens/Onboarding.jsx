import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy, LANGS } from '../data/copy'
import { Icon } from '../components/Icon'

export function Onboarding() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  const t = copy[lang]
  return (
    <div className="absolute inset-0 flex flex-col justify-end animate-dbfade">
      <img src="/img/sungnyemun_after.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15,18,30,.15) 0%, rgba(15,18,30,.35) 45%, rgba(13,16,26,.92) 100%)' }} />
      <div className="relative px-[30px] pb-[46px] text-white">
        <div className="inline-flex items-center gap-2 px-3 py-[7px] bg-white/15 backdrop-blur rounded-full mb-5">
          <Icon name="sparkle" size={14} />
          <span className="text-[13px]">{t.brandSub}</span>
        </div>
        <div className="text-[36px] font-bold leading-[1.18] whitespace-pre-line tracking-tight">{t.onbTitle}</div>
        <div className="text-[15px] text-white/80 mt-4 whitespace-pre-line">{t.onbBody}</div>
        <div className="mt-6">
          <div className="text-[12px] text-white/60 mb-2">{t.onbLang}</div>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((o) => (
              <button key={o.key} onClick={() => setLang(o.key)}
                className={`px-4 py-2 rounded-full text-[14px] ${lang === o.key ? 'bg-white text-black' : 'bg-white/15 text-white'}`}>{o.label}</button>
            ))}
          </div>
        </div>
        <button onClick={() => nav('/home')}
          className="mt-7 w-full h-14 rounded-2xl bg-primary text-white font-bold text-[17px] flex items-center justify-center gap-2">
          {t.onbStart} <Icon name="chevron-right" size={18} />
        </button>
      </div>
    </div>
  )
}
