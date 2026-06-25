import { useRef } from 'react'

export function BottomSheet({ open, state, collapsedH, expandedH, onToggle, title, children }) {
  const start = useRef(null)
  const height = state === 'expanded' ? expandedH : collapsedH
  if (!open) return null

  const onDown = (e) => { start.current = e.clientY }
  const onUp = (e) => {
    if (start.current === null) return
    const dy = start.current - e.clientY
    if (Math.abs(dy) > 24) {
      if (dy > 0 && state === 'collapsed') onToggle()
      if (dy < 0 && state === 'expanded') onToggle()
    }
    start.current = null
  }

  return (
    <div style={{ height, bottom: 90, transition: 'height .28s cubic-bezier(.2,0,0,1)' }}
         className="absolute left-0 right-0 bg-white rounded-t-sheet shadow-[0_-10px_34px_-10px_rgba(20,20,40,.22)] z-40">
      <div data-testid="sheet-handle" onPointerDown={onDown} onPointerUp={onUp}
           onClick={onToggle} className="pt-3 pb-2 flex flex-col items-center cursor-grab">
        <span className="w-9 h-1 rounded-full bg-black/20" />
        <div className="w-full px-content mt-2 font-bold text-[17px]">{title}</div>
      </div>
      <div className="px-content overflow-y-auto nsb" style={{ height: height - 70 }}>{children}</div>
    </div>
  )
}
