import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from './Icon'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'

export function BottomNav() {
  const nav = useNavigate()
  const loc = useLocation()
  const lang = useAppStore((s) => s.lang)
  const setSheetOpen = useAppStore((s) => s.setSheetOpen)
  const t = copy[lang]
  const tabs = [
    { path: '/home', icon: 'home', label: t.navHome },
    { path: '/map', icon: 'map', label: t.navMap },
    { path: '/saved', icon: 'bookmark', label: t.navSaved },
    { path: '/my', icon: 'graduation', label: t.navMy },
  ]
  return (
    <div className="absolute bottom-0 left-0 right-0 min-h-[62px] pb-[env(safe-area-inset-bottom)] bg-white border-t border-black/8 flex items-center justify-around px-2 z-30">
      {tabs.slice(0, 2).map((tab) => <NavBtn key={tab.path} tab={tab} loc={loc} nav={nav} />)}
      <button data-testid="camera-fab" onClick={() => setSheetOpen(true)}
        className="relative w-[52px] h-[52px] rounded-full bg-primary text-white flex items-center justify-center -mt-5 shadow-lg shrink-0 transition-transform active:scale-90">
        {/* 핵심 동작(카메라)으로 시선을 끄는 잔잔한 확산 링 */}
        <span className="absolute inset-0 rounded-full bg-primary animate-fabPulse" />
        <Icon name="camera" size={23} />
      </button>
      {tabs.slice(2).map((tab) => <NavBtn key={tab.path} tab={tab} loc={loc} nav={nav} />)}
    </div>
  )
}

function NavBtn({ tab, loc, nav }) {
  const active = loc.pathname === tab.path
  return (
    <button onClick={() => nav(tab.path)}
      className={`flex flex-col items-center gap-0.5 w-14 transition-transform active:scale-90 ${active ? 'text-primary scale-105' : 'text-black/30'}`}>
      <Icon name={tab.icon} size={22} />
      <span className="text-[10px]">{tab.label}</span>
    </button>
  )
}
