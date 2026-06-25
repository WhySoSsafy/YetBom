export function Switch({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`w-[46px] h-[28px] rounded-full transition-colors relative shrink-0 ${on ? 'bg-primary' : 'bg-black/15'}`}>
      <span className={`absolute top-[3px] w-[22px] h-[22px] rounded-full bg-white shadow transition-all ${on ? 'left-[21px]' : 'left-[3px]'}`} />
    </button>
  )
}
