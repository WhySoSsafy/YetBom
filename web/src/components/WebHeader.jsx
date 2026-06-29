import { Link, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { LangToggle } from './LangToggle'

// 웹 페이지 공용 상단 네비 (랜딩 ↔ 지도 대시보드를 한 흐름으로 묶는다)
export function WebHeader() {
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang] || copy.en
  const loc = useLocation()
  const links = [
    { to: '/web', label: t.webNavHome },
    { to: '/web/map', label: t.webNavMap },
  ]
  return (
    <header className="sticky top-0 z-[1100] bg-white/90 backdrop-blur border-b border-black/5">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/web" className="font-bold text-[20px] text-primary">✦ 옛봄</Link>
        <nav className="flex items-center gap-6 text-[14px]">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className={loc.pathname === l.to ? 'text-primary font-semibold' : 'text-black/70 hover:text-black'}>
              {l.label}
            </Link>
          ))}
          <LangToggle />
        </nav>
      </div>
    </header>
  )
}
