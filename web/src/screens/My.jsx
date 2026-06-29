import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { LangToggle } from '../components/LangToggle'
import { Icon } from '../components/Icon'

export function My() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  const saved = useAppStore((s) => s.saved)
  const visited = useAppStore((s) => s.visited)
  const quizCount = useAppStore((s) => s.quizCount)
  const t = copy[lang]

  // 실제 store 데이터 기반 통계
  const stats = [
    { label: { ko: '방문', en: 'Visited' }, value: Object.keys(visited).length },
    { label: { ko: '저장', en: 'Saved' }, value: Object.keys(saved).length },
    { label: { ko: '퀴즈', en: 'Quiz' }, value: quizCount },
  ]
  const settings = [
    { label: { ko: '언어 설정', en: 'Language' }, value: lang === 'ko' ? '한국어' : 'English', onClick: () => setLang(lang === 'ko' ? 'en' : 'ko') },
    { label: { ko: '알림 설정', en: 'Notifications' }, onClick: () => nav('/notifications') },
    { label: { ko: '저장한 문화유산', en: 'Saved heritage' }, value: Object.keys(saved).length, onClick: () => nav('/saved') },
    { label: { ko: '둘러보기', en: 'Explore map' }, onClick: () => nav('/map') },
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
        {stats.map((st, i) => (
          <div key={i} className="flex-1 rounded-card bg-black/5 py-4 text-center">
            <div className="text-[20px] font-bold text-primary">{st.value}</div>
            <div className="text-[12px] text-black/55">{st.label[lang]}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 divide-y divide-black/5">
        {settings.map((st, i) => (
          <button key={i} onClick={st.onClick} className="w-full flex items-center justify-between py-4 text-left text-[15px] active:bg-black/[0.03] transition-colors">
            <span>{st.label[lang]}</span>
            <span className="flex items-center gap-1 text-black/40">
              {st.value !== undefined && <span className="text-[14px]">{st.value}</span>}
              <Icon name="chevron-right" size={18} />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
