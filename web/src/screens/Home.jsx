import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { heritages } from '../data/heritage'
import { HeritageCard } from '../components/HeritageCard'
import { LangToggle } from '../components/LangToggle'
import { Icon } from '../components/Icon'

const banners = [
  { img: '/img/gyeongbok_night.png', text: { ko: '야간개장 · 경복궁 별빛 야행\n오늘 19:00–21:30 · 예약 오픈', en: 'Night opening · Gyeongbokgung\nToday 19:00–21:30' } },
  { img: '/img/sungnyemun_after.png', text: { ko: '오늘의 문화유산 · 숭례문, 다시 보다\n복원 전·후를 비교해 보세요', en: "Today's heritage · Sungnyemun\nCompare before & after" } },
]

export function Home() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  const openHeritage = (h) => nav(h.supported ? `/detail/${h.id}` : '/unsupported')
  return (
    <div className="pt-[58px]">
      <div className="px-content flex items-center justify-between">
        <div className="flex items-center gap-1 text-[14px]"><Icon name="location" size={16} />{t.homeLocation}</div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button onClick={() => nav('/notifications')}><Icon name="bell" size={22} /></button>
        </div>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto nsb px-content snap-x snap-mandatory">
        {banners.map((b, i) => (
          <div key={i} className="relative shrink-0 w-[92%] h-[480px] rounded-card-lg overflow-hidden snap-center">
            <img src={b.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,.75))' }} />
            <div className="absolute bottom-5 left-5 right-5 text-white text-[18px] font-bold whitespace-pre-line">{b.text[lang]}</div>
          </div>
        ))}
      </div>
      <div className="px-content mt-7">
        <h2 className="text-[18px] font-bold mb-1">{t.homeRecommend}</h2>
        {heritages.map((h, i) => (
          <HeritageCard key={h.id} heritage={h} lang={lang} index={i} onClick={() => openHeritage(h)} thumbSize={96} />
        ))}
      </div>
    </div>
  )
}
