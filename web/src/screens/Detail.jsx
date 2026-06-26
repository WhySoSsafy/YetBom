import { useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { getHeritage } from '../data/heritage'
import { getCommentary } from '../data/commentary'
import { askAI } from '../api/chat'
import { USE_MOCK } from '../api/client'
import { requestTTS } from '../api/tts'
import { Icon } from '../components/Icon'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'
import { CommentaryPlayer } from '../components/CommentaryPlayer'
import { AskAIChat } from '../components/AskAIChat'
import { Quiz } from '../components/Quiz'

const ACCENT = { blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700', orange: 'bg-orange-50 text-orange-700', purple: 'bg-primary/10 text-primary' }

export function Detail() {
  const { id } = useParams()
  const nav = useNavigate()
  const s = useAppStore()
  const lang = s.lang
  const t = copy[lang]
  const h = getHeritage(id)
  const c = getCommentary(id)
  const ttsTimer = useRef(null)
  const audioRef = useRef(null)

  // TTS mock 타이머 — 매 틱마다 store 최신값을 읽어 진행 (stale closure 방지)
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

  // TTS 실제 오디오 재생 — USE_MOCK=false일 때만 동작
  useEffect(() => {
    if (USE_MOCK) return
    if (!s.mPlay) { audioRef.current?.pause(); return }
    let cancelled = false
    const text = getCommentary(id)?.modes.find((m) => m.key === s.mMode)?.text[lang]
    requestTTS(text).then((res) => {
      if (cancelled) return
      if (!res?.audio_data) { useAppStore.getState().setTTS('m', { play: false }); return }
      const audio = new Audio('data:audio/mpeg;base64,' + res.audio_data)
      audio.playbackRate = useAppStore.getState().mSpeed
      audio.ontimeupdate = () => {
        const dur = audio.duration
        if (!dur || !isFinite(dur)) return
        useAppStore.getState().setTTS('m', { progress: (audio.currentTime / dur) * 100 })
      }
      audio.onended = () => useAppStore.getState().setTTS('m', { play: false, progress: 100 })
      audioRef.current = audio
      audio.play().catch(() => useAppStore.getState().setTTS('m', { play: false }))
    }).catch(() => { if (!cancelled) useAppStore.getState().setTTS('m', { play: false }) })
    return () => { cancelled = true; audioRef.current?.pause() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.mPlay])

  // 재생 중 속도 변경 반영 (실제 오디오 경로)
  useEffect(() => {
    if (USE_MOCK) return
    if (audioRef.current) audioRef.current.playbackRate = s.mSpeed
  }, [s.mSpeed])

  if (!h || !c) return <div className="p-content pt-16">Not found</div>

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
        <img src={h.thumb} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        <button onClick={() => nav(-1)} className="absolute top-14 left-4 text-white"><Icon name="chevron-left" size={26} /></button>
        <button onClick={() => s.toggleSaved(id)} className="absolute top-14 right-4 text-white"><Icon name="bookmark" size={24} /></button>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-[24px] font-bold">{h.name[lang]}</div>
          <div className="text-[13px] text-white/80">{h.era[lang]}</div>
        </div>
      </div>

      <div className="px-content py-6 space-y-8">
        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailBeforeAfter}</h2>
          <BeforeAfterSlider beforeSrc={h.before} afterSrc={h.after}
            pos={s.mSliderPos} onPosChange={(p) => s.setSlider('m', p)}
            beforeLabel={t.detailBefore} afterLabel={t.detailAfter} />
          <div className="mt-2 flex items-center gap-2 text-[12px] text-orange-600">
            <Icon name="sparkle" size={14} />{t.detailAiEstimate}
            <span className="text-black/40 ml-auto">{t.detailSource}</span>
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailWhatChanged}</h2>
          <div className="space-y-3">
            {c.changes.map((ch, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-card bg-black/[.03]">
                <div className="w-10 h-10 rounded-card bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon name={ch.icon} size={20} /></div>
                <div>
                  <div className="font-semibold text-[15px]">{ch.title[lang]}</div>
                  <div className="text-[13px] text-black/60 mt-1">{ch.body[lang]}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailCommentary}</h2>
          <CommentaryPlayer modes={c.modes} lang={lang} activeMode={s.mMode}
            onModeChange={(m) => s.setMode('m', m)} play={s.mPlay} progress={s.mTTS} speed={s.mSpeed}
            onPlayToggle={() => s.setTTS('m', { play: !s.mPlay })}
            onSpeedChange={(sp) => s.setTTS('m', { speed: sp })} />
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailAskAi}</h2>
          <AskAIChat chat={s.mChat} suggestions={c.suggestedQuestions} lang={lang}
            input={s.mInput} onInputChange={(v) => s.setInput('m', v)} onSend={handleSend} />
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailSummary}</h2>
          <div className="grid grid-cols-2 gap-2">
            {c.summaryCards.map((card, i) => (
              <div key={i} className={`p-3 rounded-card ${ACCENT[card.accent]}`}>
                <div className="text-[11px] opacity-70">{card.label[lang]}</div>
                <div className="text-[15px] font-bold mt-1">{card.value[lang]}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-bold mb-3">{t.detailQuiz}</h2>
          <Quiz questions={c.quiz} lang={lang} picks={s.mPick}
            onPick={(qi, oi) => s.setPick('m', qi, oi)} onReset={() => s.resetQuiz('m')} />
        </section>
      </div>
    </div>
  )
}
