import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { Icon } from '../components/Icon'

export function Unsupported() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-content text-center">
      <button onClick={() => nav(-1)} className="absolute top-16 left-4"><Icon name="chevron-left" size={24} /></button>
      <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4"><Icon name="search" size={28} /></div>
      <h1 className="text-[20px] font-bold">{t.unsupportedTitle}</h1>
      <p className="text-[14px] text-black/55 mt-2">
        {lang === 'ko' ? '데이터를 계속 확충하고 있어요.\n조금만 기다려 주세요.' : 'We are expanding our dataset.\nPlease check back soon.'}
      </p>
      <button onClick={() => nav('/home')} className="mt-6 px-5 py-3 rounded-btn bg-primary text-white text-[14px]">{t.unsupportedBrowse}</button>
    </div>
  )
}
