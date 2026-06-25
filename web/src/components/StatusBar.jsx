export function StatusBar({ color = '#000' }) {
  return (
    <div style={{ color }} className="absolute top-0 left-0 right-0 h-[52px] z-[55] flex items-center justify-between px-[30px] pt-4 pointer-events-none">
      <span className="font-semibold text-base leading-none">9:41</span>
      <span className="flex gap-[7px] items-center">
        <span className="flex gap-[2px] items-end h-[11px]">
          {[5, 7, 9, 11].map((h) => (
            <i key={h} style={{ height: h }} className="w-[3px] bg-current rounded-[1px] block" />
          ))}
        </span>
        <span className="inline-flex items-center gap-[2px]">
          <i className="w-[22px] h-[11px] border-[1.5px] border-current rounded-[3px] block relative">
            <b className="absolute inset-[1.5px] w-[13px] bg-current rounded-[1px] block" />
          </i>
        </span>
      </span>
    </div>
  )
}
