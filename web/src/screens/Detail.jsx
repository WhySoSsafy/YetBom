import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy, tr } from '../data/copy'
import { getHeritage } from '../data/heritage'
import { getCommentary } from '../data/commentary'
import { fetchHeritageById, fetchWikiSummary } from '../api/wiki'
import { askAI, generateOverview } from '../api/chat'
import { USE_MOCK } from '../api/client'
import { requestTTS } from '../api/tts'
import { Icon } from '../components/Icon'
import { Thumb } from '../components/Thumb'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'
import { CommentaryPlayer } from '../components/CommentaryPlayer'
import { AskAIChat } from '../components/AskAIChat'
import { Quiz } from '../components/Quiz'

const ACCENT = { blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700', orange: 'bg-orange-50 text-orange-700', purple: 'bg-primary/10 text-primary' }

const WIKI_LABEL = { ko: '해설', en: 'Overview', ja: '解説', zh: '解说', es: 'Resumen' }

export function Detail() {
  const { id } = useParams()
  const nav = useNavigate()
  const s = useAppStore()
  const lang = s.lang
  const t = copy[lang] || copy.en
  const curated = getHeritage(id)
  const c = getCommentary(id)
  const isCurated = !!(curated && c)
  const ttsTimer = useRef(null)
  const audioRef = useRef(null)

  // 동적(위키) 항목: 메타 + 위키피디아 요약을 실시간 로딩
  const [dyn, setDyn] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(!isCurated)

  useEffect(() => { if (id) useAppStore.getState().markVisited(id) }, [id])

  useEffect(() => {
    if (isCurated || !id) { setLoading(false); return }
    let on = true
    setLoading(true); setSummary(null)
    fetchHeritageById(id, lang).then(async (meta) => {
      if (!on) return
      setDyn(meta)
      const sum = await fetchWikiSummary(meta?.article, lang)
      const image = sum?.image || meta?.image || null
      let extract = sum?.extract || ''
      let ai = false
      // 위키 요약이 없으면 AI 도슨트가 선택 언어로 해설 생성
      if (!extract) { extract = await generateOverview(typeof meta?.name === 'string' ? meta.name : tr(meta?.name, lang), lang); ai = !!extract }
      if (on) setSummary({ extract, image, ai })
    }).finally(() => { if (on) setLoading(false) })
    return () => { on = false }
  }, [id, lang, isCurated])

  const heritage = curated || dyn
  const modes = isCurated
    ? c.modes
    : (summary?.extract ? [{ key: 'wiki', label: WIKI_LABEL, text: summary.extract }] : [])
  const heroSrc = heritage?.thumb || summary?.image || heritage?.image
  const activeText = tr((modes.find((m) => m.key === s.mMode) || modes[0])?.text, lang)

  // TTS mock 타이머
  useEffect(() => {
    if (!USE_MOCK) return
    if (!s.mPlay) return
    ttsTimer.current = setInterval(() => {
      const st = useAppStore.getState()
      const next = st.mTTS + st.mSpeed * 1.1
      if (next >= 100) { st.setTTS('m', { play: false, progress: 100 }); clearInterval(ttsTimer.current) }
      else st.setTTS('m', { progress: next })
    }, 55)
    return () => clearInterval(ttsTimer.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.mPlay])

  // TTS 실제 오디오 재생
  useEffect(() => {
    if (USE_MOCK) return
    if (!s.mPlay) { audioRef.current?.pause(); useAppStore.getState().setTTS('m', { loading: false }); return }
    let cancelled = false
    if (!activeText) { useAppStore.getState().setTTS('m', { play: false }); return }
    useAppStore.getState().setTTS('m', { loading: true })
    requestTTS(activeText).then((res) => {
      if (cancelled) return
      if (!res?.audio_data) { useAppStore.getState().setTTS('m', { play: false, loading: false }); return }
      const audio = new Audio('data:audio/mpeg;base64,' + res.audio_data)
      audio.playbackRate = useAppStore.getState().mSpeed
      audio.ontimeupdate = () => {
        const dur = audio.duration
        if (!dur || !isFinite(dur)) return
        useAppStore.getState().setTTS('m', { progress: (audio.currentTime / dur) * 100 })
      }
      audio.onended = () => useAppStore.getState().setTTS('m', { play: false, progress: 100, loading: false })
      audioRef.current = audio
      audio.play()
        .then(() => useAppStore.getState().setTTS('m', { loading: false }))
        .catch(() => useAppStore.getState().setTTS('m', { play: false, loading: false }))
    }).catch(() => { if (!cancelled) useAppStore.getState().setTTS('m', { play: false, loading: false }) })
    return () => { cancelled = true; audioRef.current?.pause() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.mPlay])

  useEffect(() => {
    if (USE_MOCK) return
    if (audioRef.current) audioRef.current.playbackRate = s.mSpeed
  }, [s.mSpeed])

  if (!heritage && loading) return <div className="absolute inset-0 flex items-center justify-center"><span data-spinner className="w-7 h-7 rounded-full border-2 border-black/15 border-t-primary animate-dbspin" /></div>
  if (!heritage) return <div className="p-content pt-16">Not found</div>

  const handleSend = async (q) => {
    s.addChat('m', { role: 'user', text: q })
    try {
      const res = await askAI(q, id, lang)
      s.addChat('m', { role: 'ai', text: res.answer, source: res.source })
    } catch {
      s.addChat('m', { role: 'ai', text: t.chatError, source: '' })
    }
  }

  return (
    <div className="absolute inset-0 overflow-y-auto nsb pb-[110px]">
      <div className="relative h-[230px]">
        <Thumb src={heroSrc} label={tr(heritage.name, lang)} className="w-full h-full object-cover text-[40px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        <button onClick={() => nav(-1)} className="absolute top-14 left-4 text-white"><Icon name="chevron-left" size={26} /></button>
        <button onClick={() => s.toggleSaved(id)} aria-pressed={!!s.saved[id]} aria-label="즐겨찾기"
          className={`absolute top-14 right-4 transition-transform active:scale-90 ${s.saved[id] ? 'text-primary' : 'text-white'}`}>
          <Icon name="bookmark" size={24} fill={s.saved[id] ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="text-[24px] font-bold">{tr(heritage.name, lang)}</div>
          {tr(heritage.era, lang) && <div className="text-[13px] text-white/80">{tr(heritage.era, lang)}</div>}
        </div>
      </div>

      <div className="px-content py-6 space-y-8">
        {isCurated && (
          <section>
            <h2 className="text-[18px] font-bold mb-3">{t.detailBeforeAfter}</h2>
            <BeforeAfterSlider beforeSrc={heritage.before} afterSrc={heritage.after}
              pos={s.mSliderPos} onPosChange={(p) => s.setSlider('m', p)}
              beforeLabel={tr(heritage.beforeLabel, lang) || t.detailBefore}
              afterLabel={tr(heritage.afterLabel, lang) || t.detailAfter} hint={t.sliderHint} />
            <div className="mt-2 flex items-center gap-2 text-[12px] text-orange-600">
              <Icon name="sparkle" size={14} />{t.detailAiEstimate}
              <span className="text-black/40 ml-auto">{t.detailSource}</span>
            </div>
          </section>
        )}

        {/* 동적 항목: 옛 사진이 없으므로 같은 사진의 흑백본을 '옛 사진'으로 두고 AI 컬러 복원 데모 */}
        {!isCurated && heroSrc && (
          <section>
            <h2 className="text-[18px] font-bold mb-3">{t.detailBeforeAfter}</h2>
            <BeforeAfterSlider beforeSrc={heroSrc} afterSrc={heroSrc}
              beforeFilter="grayscale(1) sepia(0.25) contrast(1.05) brightness(0.95)"
              pos={s.mSliderPos} onPosChange={(p) => s.setSlider('m', p)}
              beforeLabel={t.demoBefore} afterLabel={t.demoAfter} hint={t.sliderHint} />
            <div className="mt-2 flex items-center gap-2 text-[12px] text-orange-600">
              <Icon name="sparkle" size={14} />{t.demoNote}
            </div>
          </section>
        )}

        {isCurated && (
          <section>
            <h2 className="text-[18px] font-bold mb-3">{t.detailWhatChanged}</h2>
            <div className="space-y-3">
              {c.changes.map((ch, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-card bg-black/[.03]">
                  <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon name={ch.icon} size={20} /></div>
                  <div>
                    <div className="font-semibold text-[15px]">{tr(ch.title, lang)}</div>
                    <div className="text-[13px] text-black/60 mt-1">{tr(ch.body, lang)}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {modes.length > 0 && (
          <section>
            <h2 className="text-[18px] font-bold mb-3">{t.detailCommentary}</h2>
            <CommentaryPlayer modes={modes} lang={lang} activeMode={s.mMode}
              onModeChange={(m) => s.setMode('m', m)} play={s.mPlay} progress={s.mTTS} speed={s.mSpeed}
              loading={s.mLoading}
              onPlayToggle={() => s.setTTS('m', { play: !s.mPlay })}
              onSpeedChange={(sp) => s.setTTS('m', { speed: sp })} />
            {!isCurated && summary?.ai && (
              <div className="mt-2 text-[12px] text-black/40">✦ {t.aiGenerated}</div>
            )}
            {!isCurated && !summary?.ai && heritage.article && (
              <a href={`https://${lang}.wikipedia.org/wiki/${encodeURIComponent(heritage.article)}`} target="_blank" rel="noreferrer"
                className="mt-2 inline-block text-[12px] text-black/40">{t.detailSource} · Wikipedia</a>
            )}
          </section>
        )}

        {!isCurated && loading && (
          <div className="flex justify-center py-4"><span className="w-6 h-6 rounded-full border-2 border-black/15 border-t-primary animate-dbspin" /></div>
        )}

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailAskAi}</h2>
          <AskAIChat chat={s.mChat} suggestions={isCurated ? c.suggestedQuestions : []} lang={lang}
            input={s.mInput} onInputChange={(v) => s.setInput('m', v)} onSend={handleSend} />
        </section>

        {isCurated && (
          <section>
            <h2 className="text-[18px] font-bold mb-3">{t.detailSummary}</h2>
            <div className="grid grid-cols-2 gap-2">
              {c.summaryCards.map((card, i) => (
                <div key={i} className={`p-3 rounded-card ${ACCENT[card.accent]}`}>
                  <div className="text-[11px] opacity-70">{tr(card.label, lang)}</div>
                  <div className="text-[15px] font-bold mt-1">{tr(card.value, lang)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {isCurated && (
          <section>
            <h2 className="text-[18px] font-bold mb-3">{t.detailQuiz}</h2>
            <Quiz questions={c.quiz} lang={lang} picks={s.mPick}
              onPick={(qi, oi) => s.setPick('m', qi, oi)} onReset={() => s.resetQuiz('m')} />
          </section>
        )}
      </div>
    </div>
  )
}
