import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { LangToggle } from '../components/LangToggle'
import { Icon } from '../components/Icon'

export function My() {
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  const stats = [
    { label: { ko: '방문', en: 'Visited' }, value: 12 },
    { label: { ko: '저장', en: 'Saved' }, value: 5 },
    { label: { ko: '퀴즈', en: 'Quiz' }, value: 8 },
  ]
  const settings = [
    { ko: '언어 설정', en: 'Language' }, { ko: '알림 설정', en: 'Notifications' },
    { ko: '저장 기록', en: 'Saved history' }, { ko: '방문한 문화유산', en: 'Visited heritage' },
    { ko: '계정 관리', en: 'Account' },
  ]
  return (
    <div className="pt-16 px-content">
      <h1 className="text-[22px] font-bold">{t.myTitle}</h1>
      <div className="flex items-center gap-3 mt-5">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center"><Icon name="graduation" size={26} /></div>
        <div className="flex-1"><div className="font-bold text-[16px]">{lang === 'ko' ? '문화유산 탐험가' : 'Heritage Explorer'}</div></div>
        <LangToggle />
      </div>
      <div className="flex gap-3 mt-5">
        {stats.map((s, i) => (
          <div key={i} className="flex-1 rounded-card bg-black/5 py-4 text-center">
            <div className="text-[20px] font-bold text-primary">{s.value}</div>
            <div className="text-[12px] text-black/55">{s.label[lang]}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 divide-y divide-black/5">
        {settings.map((s, i) => (
          <button key={i} className="w-full flex items-center justify-between py-4 text-left text-[15px]">
            {s[lang]} <Icon name="chevron-right" size={18} />
          </button>
        ))}
      </div>
    </div>
  )
}
