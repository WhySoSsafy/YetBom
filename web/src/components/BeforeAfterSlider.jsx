import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

export function BeforeAfterSlider({ beforeSrc, afterSrc, pos, onPosChange, beforeLabel, afterLabel, hint }) {
  const ref = useRef(null)
  const dragging = useRef(false)
  const rafRef = useRef(0)
  // 최초 진입 시 '드래그 가능' 신호용. 사용자가 한 번이라도 만지면 끈다.
  const [hinting, setHinting] = useState(true)
  const [demoPos, setDemoPos] = useState(pos)

  // 자동 스윕: 경계선을 한 번 왕복시켜 두 사진이 바뀌는 걸 보여준다 (가장 강한 어포던스)
  useEffect(() => {
    if (!hinting) return
    const start = pos
    let t0 = 0
    const DURATION = 1700
    const step = (now) => {
      if (!t0) t0 = now
      const t = Math.min(1, (now - t0) / DURATION)
      const offset = Math.sin(t * Math.PI * 2) * 24 // ±24% 1회 왕복
      setDemoPos(Math.min(90, Math.max(10, start + offset)))
      if (t < 1) rafRef.current = requestAnimationFrame(step)
      else setDemoPos(start)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hinting])

  const stopHint = () => {
    if (!hinting) return
    cancelAnimationFrame(rafRef.current)
    setHinting(false)
  }

  const viewPos = hinting ? demoPos : pos

  const update = (clientX) => {
    const rect = ref.current.getBoundingClientRect()
    const p = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    onPosChange(p)
  }
  const onDown = (e) => {
    stopHint()
    dragging.current = true
    if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId)
    update(e.clientX)
  }
  const onMove = (e) => { if (dragging.current) update(e.clientX) }
  const onUp = () => { dragging.current = false }

  return (
    <div ref={ref} onPointerDown={onDown} onPointerMove={onMove}
         onPointerUp={onUp}
         className="relative w-full aspect-[4/3] rounded-card-lg overflow-hidden select-none touch-none cursor-ew-resize">
      <img src={afterSrc} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <img data-overlay src={beforeSrc} alt="" draggable={false}
           style={{ clipPath: `inset(0 ${100 - viewPos}% 0 0)` }}
           className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/55 text-white text-[11px]">{beforeLabel}</span>
      <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/55 text-white text-[11px]">{afterLabel}</span>
      <div style={{ left: `${viewPos}%` }} className="absolute top-0 bottom-0 -ml-[1px] w-[2px] bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
          {hinting && <span className="absolute inset-0 rounded-full bg-primary/60 animate-ping" />}
          <Icon name="chevron-left" size={14} />
          <Icon name="chevron-right" size={14} />
        </div>
      </div>
      {hinting && (
        <div className="absolute left-1/2 bottom-3 -translate-x-1/2 flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/65 text-white text-[12px] whitespace-nowrap pointer-events-none animate-pulse">
          <Icon name="chevron-left" size={12} />
          {hint || '드래그하여 비교'}
          <Icon name="chevron-right" size={12} />
        </div>
      )}
    </div>
  )
}
