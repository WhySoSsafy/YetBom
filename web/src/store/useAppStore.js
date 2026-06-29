import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// localStorage가 없는 환경(테스트/일부 프라이빗 모드)에서는 메모리로 폴백한다.
function safeStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.getItem('__yb_probe__')
      return window.localStorage
    }
  } catch { /* fall through */ }
  const mem = new Map()
  return {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, v) },
    removeItem: (k) => { mem.delete(k) },
  }
}

const initial = {
  lang: 'ko',
  captureMode: 'camera',
  capturedImage: null,
  sheetOpen: false,
  mapSheet: 'collapsed',
  saved: {},
  visited: {},
  quizCount: 0,
  noti: { ads: true, today: true, newRestore: true, nearby: true },
  mSliderPos: 50, wSliderPos: 50,
  mMode: '30s', wMode: '30s',
  mPlay: false, wPlay: false,
  mTTS: 0, wTTS: 0,
  mLoading: false, wLoading: false,
  mSpeed: 1, wSpeed: 1,
  mChat: [], wChat: [],
  mPick: {}, wPick: {},
  mInput: '', wInput: '',
}

export const useAppStore = create(persist((set) => ({
  ...initial,
  __reset: () => set({ ...initial, capturedImage: null, saved: {}, visited: {}, quizCount: 0, noti: { ...initial.noti }, mPick: {}, wPick: {}, mChat: [], wChat: [] }),
  setLang: (lang) => set({ lang }),
  setCapturedImage: (img) => set({ capturedImage: img }),
  toggleSaved: (id) => set((s) => {
    const saved = { ...s.saved }
    if (saved[id]) delete saved[id]; else saved[id] = true
    return { saved }
  }),
  markVisited: (id) => set((s) => (s.visited[id] ? s : { visited: { ...s.visited, [id]: true } })),
  setNoti: (key, value) => set((s) => ({ noti: { ...s.noti, [key]: value } })),
  setMapSheet: (state) => set({ mapSheet: state }),
  setSheetOpen: (v) => set({ sheetOpen: v }),
  setCaptureMode: (m) => set({ captureMode: m }),
  setSlider: (surface, pos) => set({ [`${surface}SliderPos`]: pos }),
  setMode: (surface, modeKey) => set({ [`${surface}Mode`]: modeKey }),
  setTTS: (surface, { play, progress, speed, loading }) => set((s) => ({
    [`${surface}Play`]: play ?? s[`${surface}Play`],
    [`${surface}TTS`]: progress ?? s[`${surface}TTS`],
    [`${surface}Speed`]: speed ?? s[`${surface}Speed`],
    [`${surface}Loading`]: loading ?? s[`${surface}Loading`],
  })),
  addChat: (surface, msg) => set((s) => ({ [`${surface}Chat`]: [...s[`${surface}Chat`], msg] })),
  setInput: (surface, v) => set({ [`${surface}Input`]: v }),
  setPick: (surface, qIdx, answerIdx) => set((s) => {
    const key = `${surface}Pick`
    if (s[key][qIdx] !== undefined) return s // 첫 선택만 고정
    return { [key]: { ...s[key], [qIdx]: answerIdx }, quizCount: s.quizCount + 1 }
  }),
  resetQuiz: (surface) => set({ [`${surface}Pick`]: {} }),
}), {
  name: 'yetbom',
  storage: createJSONStorage(safeStorage),
  // 사용자 자산만 영속화(즐겨찾기/방문/퀴즈/언어/알림). 일시적 UI 상태는 제외.
  partialize: (s) => ({ saved: s.saved, visited: s.visited, quizCount: s.quizCount, lang: s.lang, noti: s.noti }),
}))
