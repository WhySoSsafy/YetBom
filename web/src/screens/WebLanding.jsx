import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { getCommentary } from '../data/commentary'
import { askAI } from '../api/chat'
import { USE_MOCK } from '../api/client'
import { requestTTS } from '../api/tts'
import { BeforeAfterSlider } from '../components/BeforeAfterSlider'
import { CommentaryPlayer } from '../components/CommentaryPlayer'
import { AskAIChat } from '../components/AskAIChat'
import { Quiz } from '../components/Quiz'
import { LangToggle } from '../components/LangToggle'
import { heritages, getHeritage } from '../data/heritage'

export function WebLanding() {
  const nav = useNavigate()
  const inputRef = useRef(null)
  const s = useAppStore()
  const lang = s.lang
  const t = copy[lang]
  const c = getCommentary('sungnyemun')
  const hero = getHeritage('sungnyemun')
  const audioRef = useRef(null)

  // TTS 실제 오디오 재생 — USE_MOCK=false일 때만 동작 (mock 모드에서는 기존 no-op 유지)
  useEffect(() => {
    if (USE_MOCK) return
    if (!s.wPlay) { audioRef.current?.pause(); return }
    let cancelled = false
    const text = getCommentary('sungnyemun')?.modes.find((m) => m.key === s.wMode)?.text[lang]
    requestTTS(text).then((res) => {
      if (cancelled) return
      if (!res?.audio_data) { useAppStore.getState().setTTS('w', { play: false }); return }
      const audio = new Audio('data:audio/mp3;base64,' + res.audio_data)
      audio.playbackRate = useAppStore.getState().wSpeed
      audio.ontimeupdate = () => {
        const dur = audio.duration
        if (!dur || !isFinite(dur)) return
        useAppStore.getState().setTTS('w', { progress: (audio.currentTime / dur) * 100 })
      }
      audio.onended = () => useAppStore.getState().setTTS('w', { play: false, progress: 100 })
      audioRef.current = audio
      audio.play().catch(() => useAppStore.getState().setTTS('w', { play: false }))
    }).catch(() => { if (!cancelled) useAppStore.getState().setTTS('w', { play: false }) })
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
      const res = await askAI(q, 'sungnyemun', lang)
      s.addChat('w', { role: 'ai', text: res.answer, source: res.source })
    } catch {
      s.addChat('w', { role: 'ai', text: t.chatError, source: '' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
          <span className="font-bold text-[20px] text-primary">✦ 다시봄</span>
          <nav className="flex items-center gap-6 text-[14px] text-black/70">
            <a>복원 비교</a><a>맞춤 해설</a><a>AI 학습</a><a>문화유산</a>
            <LangToggle />
            <button className="px-4 py-2 rounded-btn bg-primary text-white" onClick={() => inputRef.current?.click()}>사진 업로드</button>
          </nav>
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-8 py-16 grid grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[13px] mb-4">{t.brandSub}</span>
          <h1 className="text-[40px] font-bold leading-tight whitespace-pre-line tracking-tight">{t.onbTitle}</h1>
          <p className="text-[16px] text-black/60 mt-4 whitespace-pre-line">{t.onbBody}</p>
          <label className="mt-6 block border-2 border-dashed border-primary/40 rounded-card-lg p-10 text-center cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); captureFile(e.dataTransfer.files?.[0]) }}>
            <input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={(e) => captureFile(e.target.files?.[0])} />
            <div className="text-[16px] font-medium">{lang === 'ko' ? '사진을 끌어다 놓으세요' : 'Drag & drop a photo'}</div>
            <div className="text-[13px] text-black/50 mt-2">{lang === 'ko' ? 'JPG·PNG·HEIC 지원 · 클릭해서 선택' : 'JPG·PNG·HEIC · click to choose'}</div>
          </label>
        </div>
        <BeforeAfterSlider beforeSrc={hero.before} afterSrc={hero.after}
          pos={s.wSliderPos} onPosChange={(p) => s.setSlider('w', p)}
          beforeLabel={t.detailBefore} afterLabel={t.detailAfter} />
      </section>

      <section className="max-w-[1000px] mx-auto px-8 py-12">
        <h2 className="text-[24px] font-bold mb-6">{t.detailCommentary}</h2>
        <CommentaryPlayer modes={c.modes} lang={lang} activeMode={s.wMode}
          onModeChange={(m) => s.setMode('w', m)} play={s.wPlay} progress={s.wTTS} speed={s.wSpeed}
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
          {heritages.map((hh) => (
            <div key={hh.id} className="rounded-card overflow-hidden border border-black/8">
              <img src={hh.thumb} alt="" className="w-full h-40 object-cover" />
              <div className="p-3"><div className="font-semibold text-[15px]">{hh.name[lang]}</div></div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5 py-8 text-center text-[13px] text-black/40">
        {t.detailSource}
      </footer>
    </div>
  )
}
