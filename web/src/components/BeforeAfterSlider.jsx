import { useRef } from 'react'
import { Icon } from './Icon'

export function BeforeAfterSlider({ beforeSrc, afterSrc, pos, onPosChange, beforeLabel, afterLabel }) {
  const ref = useRef(null)
  const dragging = useRef(false)

  const update = (clientX) => {
    const rect = ref.current.getBoundingClientRect()
    const p = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    onPosChange(p)
  }
  const onDown = (e) => { dragging.current = true; update(e.clientX) }
  const onMove = (e) => { if (dragging.current) update(e.clientX) }
  const onUp = () => { dragging.current = false }

  return (
    <div ref={ref} onPointerDown={onDown} onPointerMove={onMove}
         onPointerUp={onUp} onPointerLeave={onUp}
         className="relative w-full aspect-[4/3] rounded-card-lg overflow-hidden select-none touch-none cursor-ew-resize">
      <img src={afterSrc} alt="" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <img data-overlay src={beforeSrc} alt="" draggable={false}
           style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
           className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/55 text-white text-[11px]">{beforeLabel}</span>
      <span className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/55 text-white text-[11px]">{afterLabel}</span>
      <div style={{ left: `${pos}%` }} className="absolute top-0 bottom-0 -ml-[1px] w-[2px] bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
          <Icon name="chevron-left" size={14} />
          <Icon name="chevron-right" size={14} />
        </div>
      </div>
    </div>
  )
}
