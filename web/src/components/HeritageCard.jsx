import { Icon } from './Icon'
import { Thumb } from './Thumb'
import { tr } from '../data/copy'

export function HeritageCard({ heritage, lang, onClick, thumbSize = 96, index = 0 }) {
  return (
    <button onClick={onClick} style={{ animationDelay: `${index * 60}ms` }}
      className="w-full flex items-center gap-3 py-3 text-left animate-cardIn transition-transform active:scale-[0.98]">
      <Thumb src={heritage.thumb} label={tr(heritage.name, lang)} style={{ width: thumbSize, height: thumbSize }}
           className="rounded-card object-cover shrink-0 text-[24px]" />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-[17px]">{tr(heritage.name, lang)}</div>
        <div className="text-[13px] text-black/60 mt-1 truncate">{tr(heritage.era, lang)}</div>
        <span className={`inline-block mt-2 px-2 py-[2px] rounded-full text-[11px] ${
          heritage.status === 'available' ? 'bg-primary text-white' : 'bg-black/8 text-black/55'
        }`}>{tr(heritage.tag, lang)}</span>
      </div>
      <Icon name="chevron-right" size={20} />
    </button>
  )
}
