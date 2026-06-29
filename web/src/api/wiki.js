// 위키데이터/위키피디아에서 한국 문화유산을 실시간으로 가져온다(저장하지 않음).
// 실패하면 빈 결과로 폴백 — 큐레이션 데이터만으로도 앱이 동작하도록 한다.

const WDQS = 'https://query.wikidata.org/sparql'

// 한국(Q884)에서 유산 지정(P1435)을 받았고 좌표(P625)가 있는 항목 — 국보·보물·사적·세계유산 등
function listQuery(lang) {
  return `SELECT DISTINCT ?item ?itemLabel ?lat ?lon ?image ?article WHERE {
  ?item wdt:P17 wd:Q884 ; wdt:P1435 ?desig ; p:P625 ?cs .
  ?cs psv:P625 ?cn . ?cn wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon .
  OPTIONAL { ?item wdt:P18 ?image . }
  OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://${lang}.wikipedia.org/> . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en,ko". }
} LIMIT 800`
}

function singleQuery(qid, lang) {
  return `SELECT ?itemLabel ?lat ?lon ?image ?article WHERE {
  VALUES ?item { wd:${qid} }
  ?item p:P625 ?cs . ?cs psv:P625 ?cn . ?cn wikibase:geoLatitude ?lat ; wikibase:geoLongitude ?lon .
  OPTIONAL { ?item wdt:P18 ?image . }
  OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://${lang}.wikipedia.org/> . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en,ko". }
} LIMIT 1`
}

async function sparql(query) {
  const res = await fetch(`${WDQS}?format=json&query=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/sparql-results+json' },
  })
  if (!res.ok) throw new Error('wdqs ' + res.status)
  return (await res.json()).results.bindings
}

function rowToHeritage(qid, b) {
  const article = b.article ? decodeURIComponent(b.article.value.split('/wiki/').pop()).replace(/_/g, ' ') : null
  return {
    id: qid,
    name: b.itemLabel?.value || qid, // 동적 항목 이름은 문자열(tr가 그대로 반환)
    lat: parseFloat(b.lat.value),
    lng: parseFloat(b.lon.value),
    image: b.image ? `${b.image.value}?width=400` : null,
    article,
    dynamic: true,
    status: 'available',
    supported: true,
  }
}

const listCache = new Map() // lang → Promise<heritage[]>
export function fetchHeritageList(lang) {
  if (listCache.has(lang)) return listCache.get(lang)
  const p = (async () => {
    const rows = await sparql(listQuery(lang))
    const seen = new Set(), out = []
    for (const b of rows) {
      const qid = b.item.value.split('/').pop()
      if (seen.has(qid) || !b.lat || !b.lon) continue
      seen.add(qid)
      out.push(rowToHeritage(qid, b))
    }
    return out
  })()
  listCache.set(lang, p)
  return p.catch((e) => { listCache.delete(lang); throw e })
}

const itemCache = new Map() // `${lang}:${qid}` → Promise<heritage|null>
export function fetchHeritageById(qid, lang) {
  const key = `${lang}:${qid}`
  if (itemCache.has(key)) return itemCache.get(key)
  const p = (async () => {
    const rows = await sparql(singleQuery(qid, lang))
    const b = rows[0]
    return b ? rowToHeritage(qid, b) : null
  })()
  itemCache.set(key, p)
  return p.catch(() => { itemCache.delete(key); return null })
}

// 위키피디아 요약(소개문) + 큰 이미지 — 상세 페이지 해설로 사용
const summaryCache = new Map() // `${lang}:${title}` → Promise<{extract,image}|null>
export function fetchWikiSummary(article, lang) {
  if (!article) return Promise.resolve(null)
  const key = `${lang}:${article}`
  if (summaryCache.has(key)) return summaryCache.get(key)
  const p = (async () => {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=original&titles=${encodeURIComponent(article)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('wiki ' + res.status)
    const data = await res.json()
    const page = Object.values(data.query?.pages || {})[0]
    return { extract: page?.extract || '', image: page?.original?.source || null }
  })()
  summaryCache.set(key, p)
  return p.catch(() => { summaryCache.delete(key); return null })
}
