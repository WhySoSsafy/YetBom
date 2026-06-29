import { useEffect, useState } from 'react'
import { fetchHeritageList } from '../api/wiki'
import { curatedHeritages } from './heritage'

// 큐레이션 4곳 + 위키데이터 실시간 목록(수백 곳)을 합쳐 반환. 로딩 실패 시 큐레이션만.
export function useHeritages(lang) {
  const [dynamic, setDynamic] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let on = true
    setLoading(true)
    fetchHeritageList(lang)
      .then((list) => { if (on) { setDynamic(list); setLoading(false) } })
      .catch(() => { if (on) { setDynamic([]); setLoading(false) } })
    return () => { on = false }
  }, [lang])

  const curatedNames = new Set(curatedHeritages.map((h) => h.name.ko))
  const merged = [...curatedHeritages, ...dynamic.filter((d) => !curatedNames.has(d.name))]
  return { list: merged, count: merged.length, loading }
}
