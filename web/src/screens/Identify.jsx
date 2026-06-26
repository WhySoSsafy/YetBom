import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { getHeritage } from '../data/heritage'
import { identifyImage } from '../api/identify'
import { Icon } from '../components/Icon'

export function Identify() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const capturedImage = useAppStore((s) => s.capturedImage)
  const t = copy[lang]
  const [result, setResult] = useState(null)
  useEffect(() => {
    let alive = true
    identifyImage(capturedImage).then((r) => { if (alive) setResult(r) })
    return () => { alive = false }
  }, [capturedImage])
  if (!result) return null
  const h = getHeritage(result.heritageId)
  if (result.heritageId === 'unsupported' || !h) {
    nav('/unsupported', { replace: true })
    return null
  }
  return (
    <div className="absolute inset-0 overflow-y-auto nsb px-content pt-16 pb-8">
      <button onClick={() => nav('/home')} className="mb-4"><Icon name="chevron-left" size={24} /></button>
      <h1 className="text-[22px] font-bold">{t.identifyTitle}</h1>
      <div className="mt-5 rounded-card-lg overflow-hidden border border-black/8">
        <div className="relative">
          <img src={h.thumb} alt="" className="w-full h-[200px] object-cover" />
          <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary text-white text-[13px] font-bold">{result.match}% {t.identifyMatch}</span>
        </div>
        <div className="p-4">
          <div className="text-[18px] font-bold">{h.name[lang]}</div>
          <div className="text-[13px] text-black/60 mt-1">{h.era[lang]}</div>
        </div>
      </div>
      <div className="mt-4 rounded-card bg-black/5 p-4">
        <div className="text-[13px] font-semibold mb-2">{t.identifyOcrResult}</div>
        <pre className="text-[13px] text-black/70 whitespace-pre-wrap font-sans">{result.ocrText}</pre>
      </div>
      <button onClick={() => nav(`/detail/${h.id}`)}
        className="mt-6 w-full h-14 rounded-2xl bg-primary text-white font-bold text-[16px]">{t.identifyStart}</button>
    </div>
  )
}
