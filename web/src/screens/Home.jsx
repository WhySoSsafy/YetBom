import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy, tr } from '../data/copy'
import { heritages } from '../data/heritage'
import { HeritageCard } from '../components/HeritageCard'
import { LangToggle } from '../components/LangToggle'
import { Icon } from '../components/Icon'

const banners = [
  { img: '/img/gyeongbok_night.png', text: {
    ko: '야간개장 · 경복궁 별빛 야행\n오늘 19:00–21:30 · 예약 오픈',
    en: 'Night Opening · Gyeongbokgung Starlight\nToday 19:00–21:30 · Booking open',
    ja: '夜間開場 · 景福宮 星明かりの夜\n本日 19:00–21:30 · 予約受付中',
    zh: '夜间开放 · 景福宫星光夜行\n今日 19:00–21:30 · 预约开放',
    es: 'Apertura nocturna · Gyeongbokgung\nHoy 19:00–21:30 · Reservas abiertas' } },
  { img: '/img/sungnyemun_after.png', text: {
    ko: '오늘의 문화유산 · 숭례문, 다시 보다\n복원 전·후를 비교해 보세요',
    en: "Today's Heritage · Sungnyemun\nCompare before & after",
    ja: '今日の文化遺産 · 崇礼門\n復元前後を比べてみよう',
    zh: '今日文化遗产 · 崇礼门\n对比复原前后',
    es: 'Patrimonio de hoy · Sungnyemun\nCompara el antes y el después' } },
  { img: '/img/cheomseongdae_after.jpg', text: {
    ko: '경주 첨성대 별빛 투어\n신라 천년의 밤하늘을 만나다',
    en: 'Cheomseongdae Starlight Tour\nMeet a thousand years of Silla sky',
    ja: '慶州 瞻星台 星空ツアー\n新羅千年の夜空に出会う',
    zh: '庆州瞻星台星空之旅\n邂逅新罗千年夜空',
    es: 'Tour estelar de Cheomseongdae\nMil años de cielo de Silla' } },
  { img: '/img/mireuksa_after.png', text: {
    ko: '미륵사지 석탑, 백제의 빛\n해체·복원 20년의 기록',
    en: 'Mireuksa Stone Pagoda, Light of Baekje\n20 years of restoration',
    ja: '弥勒寺址 石塔、百済の光\n解体・復元 20年の記録',
    zh: '弥勒寺址石塔，百济之光\n解体复原20年纪实',
    es: 'Pagoda de Mireuksa, luz de Baekje\n20 años de restauración' } },
  { img: '/img/gyeongbok_after.jpg', text: {
    ko: '한복 입고 고궁 나들이\n한복 착용 시 무료 입장',
    en: 'Hanbok Day at the Palaces\nFree entry in hanbok',
    ja: '韓服で古宮さんぽ\n韓服着用で無料入場',
    zh: '穿韩服游古宫\n着韩服免费入场',
    es: 'Día de hanbok en los palacios\nEntrada gratis con hanbok' } },
]

export function Home() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const t = copy[lang]
  const openHeritage = (h) => nav(h.supported ? `/detail/${h.id}` : '/unsupported')

  // 광고 배너 자동 전환 (4초마다) — idx가 바뀔 때마다 타이머 재설정(스와이프 후에도 일정)
  const [idx, setIdx] = useState(0)
  const startX = useRef(null)
  const next = () => setIdx((i) => (i + 1) % banners.length)
  const prev = () => setIdx((i) => (i - 1 + banners.length) % banners.length)
  useEffect(() => {
    const timer = setTimeout(next, 4000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx])

  // 스와이프로 이전/다음
  const onDown = (e) => { startX.current = e.clientX }
  const onUp = (e) => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    startX.current = null
    if (dx <= -40) next()
    else if (dx >= 40) prev()
  }

  return (
    <div className="pt-[58px]">
      <div className="px-content flex items-center justify-between">
        <div className="flex items-center gap-1 text-[14px]"><Icon name="location" size={16} />{t.homeLocation}</div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button onClick={() => nav('/notifications')}><Icon name="bell" size={22} /></button>
        </div>
      </div>
      <div className="mt-4 px-content">
        <div onPointerDown={onDown} onPointerUp={onUp}
          className="relative h-[336px] rounded-card-lg overflow-hidden select-none touch-pan-y">
          <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
            {banners.map((b, i) => (
              <div key={i} className="relative w-full h-full shrink-0">
                <img src={b.img} alt="" draggable={false} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,.75))' }} />
                <div className="absolute bottom-6 left-5 right-5 text-white text-[18px] font-bold whitespace-pre-line">{tr(b.text, lang)}</div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`배너 ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="px-content mt-7">
        <h2 className="text-[18px] font-bold mb-1">{t.homeRecommend}</h2>
        {heritages.filter((h) => h.supported).map((h, i) => (
          <HeritageCard key={h.id} heritage={h} lang={lang} index={i} onClick={() => openHeritage(h)} thumbSize={96} />
        ))}
      </div>
    </div>
  )
}
