import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy, tr, LANGS } from '../data/copy'
import { getCommentary } from '../data/commentary'
import { askAI } from '../api/chat'
import { USE_MOCK } from '../api/client'
import { requestTTS } from '../api/tts'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'
import { CommentaryPlayer } from '../components/CommentaryPlayer'
import { AskAIChat } from '../components/AskAIChat'
import { Quiz } from '../components/Quiz'
import { WebHeader } from '../components/WebHeader'
import { Thumb } from '../components/Thumb'
import { heritages, getHeritage } from '../data/heritage'

const demoSites = heritages.filter((h) => h.supported)

export function WebLanding() {
  const nav = useNavigate()
  const inputRef = useRef(null)
  const s = useAppStore()
  const lang = s.lang
  const t = copy[lang]
  // 심사위원이 사진 없이 바로 체험할 수 있게, 큐레이션 문화유산을 골라 데모를 본다.
  const [demoId, setDemoId] = useState('sungnyemun')
  const c = getCommentary(demoId)
  const hero = getHeritage(demoId)
  const audioRef = useRef(null)

  const selectDemo = (id) => {
    setDemoId(id)
    s.setTTS('w', { play: false, progress: 0 })
    s.resetQuiz('w')
    s.setSlider('w', 50)
    s.setMode('w', '30s')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // TTS 실제 오디오 재생 — USE_MOCK=false일 때만 동작 (mock 모드에서는 기존 no-op 유지)
  useEffect(() => {
    if (USE_MOCK) return
    if (!s.wPlay) { audioRef.current?.pause(); useAppStore.getState().setTTS('w', { loading: false }); return }
    let cancelled = false
    const text = tr(getCommentary(demoId)?.modes.find((m) => m.key === s.wMode)?.text, lang)
    useAppStore.getState().setTTS('w', { loading: true })
    requestTTS(text).then((res) => {
      if (cancelled) return
      if (!res?.audio_data) { useAppStore.getState().setTTS('w', { play: false, loading: false }); return }
      const audio = new Audio('data:audio/mpeg;base64,' + res.audio_data)
      audio.playbackRate = useAppStore.getState().wSpeed
      audio.ontimeupdate = () => {
        const dur = audio.duration
        if (!dur || !isFinite(dur)) return
        useAppStore.getState().setTTS('w', { progress: (audio.currentTime / dur) * 100 })
      }
      audio.onended = () => useAppStore.getState().setTTS('w', { play: false, progress: 100, loading: false })
      audioRef.current = audio
      audio.play()
        .then(() => useAppStore.getState().setTTS('w', { loading: false }))
        .catch(() => useAppStore.getState().setTTS('w', { play: false, loading: false }))
    }).catch(() => { if (!cancelled) useAppStore.getState().setTTS('w', { play: false, loading: false }) })
    return () => { cancelled = true; audioRef.current?.pause() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.wPlay])

  // 재생 중 속도 변경 반영 (실제 오디오 경로)
  useEffect(() => {
    if (USE_MOCK) return
    if (audioRef.current) audioRef.current.playbackRate = s.wSpeed
  }, [s.wSpeed])

  const captureFile = (file) => {
    if (!file) { nav('/analyzing'); return }
    const reader = new FileReader()
    reader.onload = () => { s.setCapturedImage(reader.result); nav('/analyzing') }
    reader.readAsDataURL(file)
  }

  const handleSend = async (q) => {
    s.addChat('w', { role: 'user', text: q })
    try {
      const res = await askAI(q, demoId, lang)
      s.addChat('w', { role: 'ai', text: res.answer, source: res.source })
    } catch {
      s.addChat('w', { role: 'ai', text: t.chatError, source: '' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <WebHeader />

      <section className="max-w-[1200px] mx-auto px-8 py-16 grid grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[13px] mb-4">{t.brandSub}</span>
          <h1 className="text-[40px] font-bold leading-tight whitespace-pre-line tracking-tight">{t.onbTitle}</h1>
          <p className="text-[16px] text-black/60 mt-4 whitespace-pre-line">{t.onbBody}</p>
          {/* 사진 없이 바로 체험 — 큐레이션 문화유산 선택 */}
          <div className="mt-6 text-[13px] font-semibold text-black/50">{t.tryDemo}</div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {demoSites.map((hh) => (
              <button key={hh.id} onClick={() => selectDemo(hh.id)}
                className={`flex items-center gap-3 p-2 rounded-card border text-left transition-colors ${
                  demoId === hh.id ? 'border-primary bg-primary/5' : 'border-black/10 hover:border-primary/40'
                }`}>
                <Thumb src={hh.thumb} className="w-12 h-12 rounded-card object-cover shrink-0 text-[20px]" />
                <div className="min-w-0">
                  <div className="font-semibold text-[14px] truncate">{tr(hh.name, lang)}</div>
                  <div className="text-[12px] text-black/50 truncate">{tr(hh.era, lang)}</div>
                </div>
              </button>
            ))}
          </div>
          <input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={(e) => captureFile(e.target.files?.[0])} />
          <button onClick={() => inputRef.current?.click()} className="mt-4 text-[13px] text-primary font-medium underline underline-offset-2">{t.orUpload}</button>
        </div>
        <div>
          <BeforeAfterSlider beforeSrc={hero.before} afterSrc={hero.after}
            pos={s.wSliderPos} onPosChange={(p) => s.setSlider('w', p)}
            beforeLabel={tr(hero.beforeLabel, lang) || t.detailBefore}
            afterLabel={tr(hero.afterLabel, lang) || t.detailAfter} hint={t.sliderHint} />
          <div className="mt-3 text-center">
            <div className="text-[16px] font-bold">{tr(hero.name, lang)}</div>
            <div className="text-[13px] text-black/55 mt-0.5">{tr(hero.era, lang)} · {t.detailBeforeAfter}</div>
          </div>
        </div>
      </section>

      {/* 다국어 지원 자랑 */}
      <section className="bg-primary/[0.04] border-y border-primary/10">
        <div className="max-w-[1200px] mx-auto px-8 py-10 text-center">
          <div className="text-[20px] font-bold">{t.langBragTitle}</div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {LANGS.map((l) => (
              <button key={l.key} onClick={() => s.setLang(l.key)}
                className={`px-4 py-2 rounded-full text-[14px] font-medium shadow-sm border transition-colors ${
                  lang === l.key ? 'bg-primary text-white border-primary' : 'bg-white border-black/8 hover:border-primary/40'
                }`}>{l.label}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1000px] mx-auto px-8 py-12">
        <h2 className="text-[24px] font-bold mb-6">{tr(hero.name, lang)} · {t.detailCommentary}</h2>
        <CommentaryPlayer modes={c.modes} lang={lang} activeMode={s.wMode}
          onModeChange={(m) => s.setMode('w', m)} play={s.wPlay} progress={s.wTTS} speed={s.wSpeed}
          loading={s.wLoading}
          onPlayToggle={() => s.setTTS('w', { play: !s.wPlay })}
          onSpeedChange={(sp) => s.setTTS('w', { speed: sp })} />
      </section>

      <section className="max-w-[1000px] mx-auto px-8 py-12">
        <h2 className="text-[24px] font-bold mb-6">{t.detailAskAi}</h2>
        <AskAIChat chat={s.wChat} suggestions={c.suggestedQuestions} lang={lang}
          input={s.wInput} onInputChange={(v) => s.setInput('w', v)} onSend={handleSend} />
      </section>

      <section className="max-w-[1000px] mx-auto px-8 py-12">
        <h2 className="text-[24px] font-bold mb-6">{t.detailQuiz}</h2>
        <Quiz questions={c.quiz} lang={lang} picks={s.wPick}
          onPick={(qi, oi) => s.setPick('w', qi, oi)} onReset={() => s.resetQuiz('w')} />
      </section>

      <section className="max-w-[1200px] mx-auto px-8 py-12">
        <h2 className="text-[24px] font-bold mb-6">{t.unsupportedBrowse}</h2>
        <div className="grid grid-cols-4 gap-4">
          {demoSites.map((hh) => (
            <button key={hh.id} onClick={() => selectDemo(hh.id)}
              className={`rounded-card overflow-hidden border text-left transition-colors ${
                demoId === hh.id ? 'border-primary ring-2 ring-primary/30' : 'border-black/8 hover:border-primary/40'
              }`}>
              <Thumb src={hh.thumb} className="w-full h-40 object-cover text-[28px]" />
              <div className="p-3"><div className="font-semibold text-[15px]">{tr(hh.name, lang)}</div></div>
            </button>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5 py-8 text-center text-[13px] text-black/40">
        {t.detailSource}
      </footer>
    </div>
  )
}
