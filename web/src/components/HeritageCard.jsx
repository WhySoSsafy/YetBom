import { Icon } from './Icon'

export function HeritageCard({ heritage, lang, onClick, thumbSize = 96 }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3 text-left">
      <img src={heritage.thumb} alt="" style={{ width: thumbSize, height: thumbSize }}
           className="rounded-card object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[17px]">{heritage.name[lang]}</div>
        <div className="text-[13px] text-black/60 mt-1 truncate">{heritage.era[lang]}</div>
        <span className={`inline-block mt-2 px-2 py-[2px] rounded-full text-[11px] ${
          heritage.status === 'available' ? 'bg-primary text-white' : 'bg-black/8 text-black/55'
        }`}>{heritage.tag[lang]}</span>
      </div>
      <Icon name="chevron-right" size={20} />
    </button>
  )
}
