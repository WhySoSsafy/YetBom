import { useAppStore } from '../store/useAppStore'
import { LANGS } from '../data/copy'

// 다국어 선택기. 언어가 늘어나도 LANGS만 추가하면 된다.
export function LangToggle() {
  const lang = useAppStore((s) => s.lang)
  const setLang = useAppStore((s) => s.setLang)
  return (
    <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label="언어 선택"
      className="px-3 py-1 rounded-full text-[13px] font-medium bg-black/5 text-black/70 border-0 outline-none cursor-pointer appearance-none">
      {LANGS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
    </select>
  )
}
