import { Icon } from './Icon'

export function CommentaryPlayer({ modes, lang, activeMode, onModeChange, play, progress, speed, onPlayToggle, onSpeedChange }) {
  const active = modes.find((m) => m.key === activeMode) || modes[0]
  const nextSpeed = { 1: 1.5, 1.5: 2, 2: 1 }
  return (
    <div>
      <div className="flex gap-2 overflow-x-auto nsb pb-1">
        {modes.map((m) => (
          <button key={m.key} onClick={() => onModeChange(m.key)}
            className={`px-3 py-[6px] rounded-full text-[13px] whitespace-nowrap ${
              m.key === activeMode ? 'bg-primary text-white' : 'bg-black/5 text-black/70'
            }`}>{m.label[lang]}</button>
        ))}
      </div>
      <p className="mt-4 text-[15px] leading-relaxed text-black/80">{active.text[lang]}</p>
      <div className="mt-4 flex items-center gap-3">
        <button onClick={onPlayToggle}
          className="w-11 h-11 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
          <Icon name={play ? 'pause' : 'play'} size={18} />
        </button>
        <div className="flex-1 h-[6px] rounded-full bg-black/10 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
        <button onClick={() => onSpeedChange(nextSpeed[speed])}
          className="px-2 py-1 rounded-md bg-black/5 text-[13px] font-medium">{speed}x</button>
      </div>
    </div>
  )
}
