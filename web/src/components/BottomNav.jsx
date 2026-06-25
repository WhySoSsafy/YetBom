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
    <div className="absolute bottom-0 left-0 right-0 h-[90px] bg-white border-t border-black/8 flex items-center justify-around px-2 z-30">
      {tabs.slice(0, 2).map((tab) => <NavBtn key={tab.path} tab={tab} loc={loc} nav={nav} />)}
      <button data-testid="camera-fab" onClick={() => setSheetOpen(true)}
        className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center -mt-6 shadow-lg shrink-0">
        <Icon name="camera" size={26} />
      </button>
      {tabs.slice(2).map((tab) => <NavBtn key={tab.path} tab={tab} loc={loc} nav={nav} />)}
    </div>
  )
}

function NavBtn({ tab, loc, nav }) {
  const active = loc.pathname === tab.path
  return (
    <button onClick={() => nav(tab.path)}
      className={`flex flex-col items-center gap-1 w-14 ${active ? 'text-primary' : 'text-black/30'}`}>
      <Icon name={tab.icon} size={25} />
      <span className="text-[11px]">{tab.label}</span>
    </button>
  )
}
