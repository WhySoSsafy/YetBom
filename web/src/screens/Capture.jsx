import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { Icon } from '../components/Icon'

export function Capture() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  return (
    <div className="absolute inset-0 bg-[#0c0d12]">
      <img src="/img/sungnyemun_after.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,.6))' }} />
      <div className="absolute top-24 left-0 right-0 text-center text-white">
        <div className="text-[20px] font-bold">{t.captureTitle}</div>
        <div className="text-[13px] text-white/70 mt-1">{t.captureHint}</div>
        <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/20 text-[12px]">{t.captureOcr}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[140px] bg-[#0c0d12] flex items-center justify-around px-8">
        <button onClick={() => nav('/analyzing')}><Icon name="layers" size={28} /></button>
        <button onClick={() => nav('/analyzing')} className="w-20 h-20 rounded-full bg-white border-4 border-white/40" />
        <button onClick={() => nav('/home')} className="text-white"><Icon name="close" size={28} /></button>
      </div>
    </div>
  )
}

export function CaptureSheet() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const sheetOpen = useAppStore((s) => s.sheetOpen)
  const setSheetOpen = useAppStore((s) => s.setSheetOpen)
  const setCaptureMode = useAppStore((s) => s.setCaptureMode)
  const t = copy[lang]
  if (!sheetOpen) return null
  const opts = [
    { mode: 'camera', label: t.captureCamera, icon: 'camera' },
    { mode: 'ocr', label: t.captureOcrOpt, icon: 'search' },
    { mode: 'qr', label: t.captureQr, icon: 'layers' },
    { mode: 'gallery', label: t.captureGallery, icon: 'bookmark' },
  ]
  const pick = (mode) => { setCaptureMode(mode); setSheetOpen(false); nav('/capture') }
  return (
    <div className="absolute inset-0 z-50" onClick={() => setSheetOpen(false)}>
      <div className="absolute inset-0 bg-black/40" />
      <div onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-sheet p-content pb-8 animate-dbfade">
        <div className="w-9 h-1 rounded-full bg-black/20 mx-auto mb-4" />
        <h3 className="font-bold text-[18px] mb-4">{t.captureSheetTitle}</h3>
        <div className="grid grid-cols-2 gap-3">
          {opts.map((o) => (
            <button key={o.mode} onClick={() => pick(o.mode)}
              className="flex flex-col items-center gap-2 py-5 rounded-card bg-black/5">
              <Icon name={o.icon} size={26} /><span className="text-[14px]">{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
