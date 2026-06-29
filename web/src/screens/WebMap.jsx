import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { copy, tr } from '../data/copy'
import { useHeritages } from '../data/useHeritages'
import { useHeritageContent } from '../data/useHeritageContent'
import { WebHeader } from '../components/WebHeader'
import { HeritageMap } from '../components/HeritageMap'
import { Thumb } from '../components/Thumb'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'
import { restorationView } from '../data/restoration'
import { Icon } from '../components/Icon'

// 우측 상세 패널 — 선택한 문화유산의 사진·복원 전후·설명
function DetailPanel({ heritage, lang, onClose }) {
  const t = copy[lang] || copy.en
  const { content, loading } = useHeritageContent(heritage, lang)
  const [pos, setPos] = useState(50)
  const img = content?.image || heritage.thumb || heritage.image
  const rv = restorationView(heritage, img, t, lang)

  return (
    <aside className="w-[420px] shrink-0 border-l border-black/8 bg-white overflow-y-auto nsb animate-screenIn">
      <div className="relative">
        <Thumb src={img} className="w-full h-52 object-cover text-[40px]" />
        <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/45 text-white flex items-center justify-center">
          <Icon name="close" size={18} />
        </button>
      </div>
      <div className="p-5">
        <h2 className="text-[22px] font-bold">{tr(heritage.name, lang)}</h2>
        {tr(heritage.era, lang) && <div className="text-[13px] text-black/55 mt-1">{tr(heritage.era, lang)}</div>}

        {rv.beforeSrc && (
          <div className="mt-5">
            <div className="text-[14px] font-bold mb-2">{t.detailBeforeAfter}</div>
            <BeforeAfterSlider key={heritage.id}
              beforeSrc={rv.beforeSrc} afterSrc={rv.afterSrc} beforeFilter={rv.beforeFilter}
              pos={pos} onPosChange={setPos}
              beforeLabel={rv.beforeLabel} afterLabel={rv.afterLabel}
              hint={t.sliderHint} />
            <div className="mt-2 flex items-center gap-2 text-[12px] text-orange-600">
              <Icon name="sparkle" size={14} />{rv.note}
            </div>
          </div>
        )}

        <div className="mt-5">
          <div className="text-[14px] font-bold mb-2">{t.detailCommentary}</div>
          {loading
            ? <div className="flex justify-center py-4"><span className="w-6 h-6 rounded-full border-2 border-black/15 border-t-primary animate-dbspin" /></div>
            : <p className="text-[14px] leading-relaxed text-black/75 whitespace-pre-line">{content?.text}</p>}
          {content?.ai && <div className="mt-2 text-[12px] text-black/40">✦ {t.aiGenerated}</div>}
          {content?.article && (
            <a href={`https://${lang}.wikipedia.org/wiki/${encodeURIComponent(content.article)}`} target="_blank" rel="noreferrer"
              className="mt-2 inline-block text-[12px] text-black/40">{t.detailSource} · Wikipedia</a>
          )}
        </div>
      </div>
    </aside>
  )
}

export function WebMap() {
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang] || copy.en
  const { list, loading } = useHeritages(lang)
  const [selected, setSelected] = useState(null)
  const [flyTo, setFlyTo] = useState(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter((h) => tr(h.name, lang).toLowerCase().includes(q))
  }, [list, query, lang])

  const select = (h) => { setSelected(h); setFlyTo(h) }

  return (
    <div className="h-screen flex flex-col">
      <WebHeader />
      <div className="flex-1 flex min-h-0">
        {/* 좌측: 검색 + 목록 */}
        <aside className="w-[340px] shrink-0 border-r border-black/8 flex flex-col">
          <div className="p-3 border-b border-black/5">
            <div className="flex items-center gap-2 px-3 h-10 rounded-btn bg-black/5">
              <Icon name="search" size={16} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.webSearch}
                className="flex-1 bg-transparent text-[14px] outline-none" />
            </div>
            <div className="mt-2 text-[12px] text-black/45 px-1">{loading ? '…' : `${list.length}`} · {t.mapNearby}</div>
          </div>
          <div className="flex-1 overflow-y-auto nsb">
            {filtered.slice(0, 300).map((h) => (
              <button key={h.id} onClick={() => select(h)}
                className={`w-full flex items-center gap-3 p-3 text-left border-b border-black/5 ${selected?.id === h.id ? 'bg-primary/5' : ''}`}>
                <Thumb src={h.thumb || h.image} className="w-12 h-12 rounded-card object-cover shrink-0 text-[18px]" />
                <div className="min-w-0">
                  <div className="font-semibold text-[14px] truncate">{tr(h.name, lang)}</div>
                  <div className="text-[12px] text-black/50 truncate">{tr(h.era, lang)}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* 중앙: 지도 */}
        <div className="flex-1 relative">
          <HeritageMap items={list} onSelect={select} flyTo={flyTo} className="absolute inset-0 z-0" />
          {!selected && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] px-4 py-2 rounded-full bg-white/90 shadow text-[13px] pointer-events-none">
              {t.webSelectHint}
            </div>
          )}
        </div>

        {/* 우측: 상세 패널 */}
        {selected && <DetailPanel heritage={selected} lang={lang} onClose={() => setSelected(null)} />}
      </div>
    </div>
  )
}
