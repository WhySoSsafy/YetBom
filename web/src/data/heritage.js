export const heritages = [
  {
    id: 'sungnyemun', name: { ko: '숭례문', en: 'Sungnyemun' },
    era: { ko: '국보 제1호 · 서울 · 조선 1398년 창건', en: 'National Treasure No.1 · Seoul · Joseon, 1398' },
    thumb: '/img/sungnyemun_after.png', supported: true,
    tag: { ko: '복원 사례', en: 'Restored' },
    distance: '320m', lat: 37.5601, lng: 126.9752, status: 'available',
  },
  {
    id: 'gyeongbok', name: { ko: '경복궁 근정전', en: 'Geunjeongjeon' },
    era: { ko: '국보 · 서울 · 조선 1395년', en: 'National Treasure · Seoul · Joseon, 1395' },
    thumb: '/img/geunjeongjeon.png', supported: true,
    tag: { ko: '인기', en: 'Popular' },
    distance: '1.2km', lat: 37.5796, lng: 126.9770, status: 'available',
  },
  {
    id: 'cheomseongdae', name: { ko: '첨성대', en: 'Cheomseongdae' },
    era: { ko: '국보 제31호 · 경주 · 신라', en: 'National Treasure No.31 · Gyeongju · Silla' },
    thumb: '/img/cheomseongdae.png', supported: true,
    tag: { ko: '복원 사례', en: 'Restored' },
    distance: '278km', lat: 35.8347, lng: 129.2190, status: 'available',
  },
  {
    id: 'mireuksa', name: { ko: '미륵사지 석탑', en: 'Mireuksa Stone Pagoda' },
    era: { ko: '국보 제11호 · 익산 · 백제', en: 'National Treasure No.11 · Iksan · Baekje' },
    thumb: '/img/stone_pagoda.png', supported: true,
    tag: { ko: '복원 사례', en: 'Restored' },
    distance: '178km', lat: 36.0120, lng: 127.0286, status: 'available',
  },
]

export function getHeritage(id) {
  return heritages.find(h => h.id === id)
}
