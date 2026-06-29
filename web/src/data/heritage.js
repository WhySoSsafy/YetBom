export const heritages = [
  {
    id: 'sungnyemun', name: { ko: '숭례문', en: 'Sungnyemun' },
    era: { ko: '국보 제1호 · 서울 · 조선 1398년 창건', en: 'National Treasure No.1 · Seoul · Joseon, 1398' },
    thumb: '/img/sungnyemun_after.png', supported: true,
    before: '/img/sungnyemun_before.png', after: '/img/sungnyemun_after.png',
    beforeLabel: { ko: '2008년 화재 직후', en: 'Right after 2008 fire' },
    afterLabel: { ko: '2013년 복원 완료', en: 'Restored in 2013' },
    tag: { ko: '복원 사례', en: 'Restored' },
    distance: '320m', lat: 37.5601, lng: 126.9752, status: 'available',
  },
  {
    id: 'gyeongbok', name: { ko: '경복궁 근정전', en: 'Geunjeongjeon' },
    era: { ko: '국보 · 서울 · 조선 1395년', en: 'National Treasure · Seoul · Joseon, 1395' },
    thumb: '/img/gyeongbok_after.jpg', supported: true,
    before: '/img/gyeongbok_before.jpg', after: '/img/gyeongbok_after.jpg',
    beforeLabel: { ko: '현재 모습', en: 'Current state' },
    afterLabel: { ko: 'AI 추정 복원', en: 'AI-estimated restoration' },
    tag: { ko: '인기', en: 'Popular' },
    distance: '1.2km', lat: 37.5796, lng: 126.9770, status: 'available',
  },
  {
    id: 'cheomseongdae', name: { ko: '첨성대', en: 'Cheomseongdae' },
    era: { ko: '국보 제31호 · 경주 · 신라', en: 'National Treasure No.31 · Gyeongju · Silla' },
    thumb: '/img/cheomseongdae_after.jpg', supported: true,
    before: '/img/cheomseongdae_before.jpg', after: '/img/cheomseongdae_after.jpg',
    beforeLabel: { ko: '현재 모습', en: 'Current state' },
    afterLabel: { ko: 'AI 추정 복원', en: 'AI-estimated restoration' },
    tag: { ko: '복원 사례', en: 'Restored' },
    distance: '278km', lat: 35.8347, lng: 129.2190, status: 'available',
  },
  {
    id: 'mireuksa', name: { ko: '미륵사지 석탑', en: 'Mireuksa Stone Pagoda' },
    era: { ko: '국보 제11호 · 익산 · 백제', en: 'National Treasure No.11 · Iksan · Baekje' },
    thumb: '/img/mireuksa_after.png', supported: true,
    before: '/img/mireuksa_before.png', after: '/img/mireuksa_after.png',
    beforeLabel: { ko: '현재 모습', en: 'Current state' },
    afterLabel: { ko: 'AI 추정 복원', en: 'AI-estimated restoration' },
    tag: { ko: '복원 사례', en: 'Restored' },
    distance: '178km', lat: 36.0120, lng: 127.0286, status: 'available',
  },

  // 지도 탐색용 추가 문화유산 (상세는 준비중 — 지도 핀/주변 목록에 노출)
  { id: 'bulguksa', name: { ko: '불국사', en: 'Bulguksa' }, era: { ko: '세계유산 · 경주 · 신라 751년', en: 'UNESCO · Gyeongju · Silla, 751' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '278km', lat: 35.7901, lng: 129.3320, status: 'soon' },
  { id: 'seokguram', name: { ko: '석굴암', en: 'Seokguram Grotto' }, era: { ko: '국보 제24호 · 경주 · 신라', en: 'National Treasure No.24 · Gyeongju · Silla' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '279km', lat: 35.7949, lng: 129.3491, status: 'soon' },
  { id: 'jongmyo', name: { ko: '종묘', en: 'Jongmyo Shrine' }, era: { ko: '세계유산 · 서울 · 조선', en: 'UNESCO · Seoul · Joseon' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '1.5km', lat: 37.5745, lng: 126.9941, status: 'soon' },
  { id: 'changdeokgung', name: { ko: '창덕궁', en: 'Changdeokgung' }, era: { ko: '세계유산 · 서울 · 조선 1405년', en: 'UNESCO · Seoul · Joseon, 1405' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '1.8km', lat: 37.5794, lng: 126.9910, status: 'soon' },
  { id: 'hwaseong', name: { ko: '수원 화성', en: 'Hwaseong Fortress' }, era: { ko: '사적·세계유산 · 수원 · 조선 1796년', en: 'Historic Site·UNESCO · Suwon · Joseon, 1796' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '34km', lat: 37.2881, lng: 127.0140, status: 'soon' },
  { id: 'haeinsa', name: { ko: '해인사 장경판전', en: 'Haeinsa Janggyeong Panjeon' }, era: { ko: '세계유산 · 합천 · 신라', en: 'UNESCO · Hapcheon · Silla' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '296km', lat: 35.8010, lng: 128.0980, status: 'soon' },
  { id: 'buseoksa', name: { ko: '부석사 무량수전', en: 'Buseoksa Muryangsujeon' }, era: { ko: '국보 · 영주 · 고려', en: 'National Treasure · Yeongju · Goryeo' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '197km', lat: 36.9985, lng: 128.6877, status: 'soon' },
  { id: 'hahoe', name: { ko: '안동 하회마을', en: 'Andong Hahoe Village' }, era: { ko: '세계유산 · 안동 · 조선', en: 'UNESCO · Andong · Joseon' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '212km', lat: 36.5392, lng: 128.5176, status: 'soon' },
  { id: 'namhansanseong', name: { ko: '남한산성', en: 'Namhansanseong' }, era: { ko: '사적·세계유산 · 광주 · 조선', en: 'Historic Site·UNESCO · Gwangju · Joseon' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '25km', lat: 37.4790, lng: 127.1812, status: 'soon' },
  { id: 'gongsanseong', name: { ko: '공주 공산성', en: 'Gongsanseong' }, era: { ko: '사적·세계유산 · 공주 · 백제', en: 'Historic Site·UNESCO · Gongju · Baekje' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '124km', lat: 36.4665, lng: 127.1245, status: 'soon' },
  { id: 'busosanseong', name: { ko: '부여 부소산성', en: 'Busosanseong' }, era: { ko: '사적·세계유산 · 부여 · 백제', en: 'Historic Site·UNESCO · Buyeo · Baekje' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '142km', lat: 36.2816, lng: 126.9106, status: 'soon' },
  { id: 'wolji', name: { ko: '경주 동궁과 월지', en: 'Donggung & Wolji' }, era: { ko: '사적 · 경주 · 신라', en: 'Historic Site · Gyeongju · Silla' }, supported: false, tag: { ko: '준비중', en: 'Coming soon' }, distance: '277km', lat: 35.8348, lng: 129.2265, status: 'soon' },
]

export function getHeritage(id) {
  return heritages.find(h => h.id === id)
}
