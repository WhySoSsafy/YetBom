import { create } from 'zustand'

const initial = {
  lang: 'ko',
  captureMode: 'camera',
  capturedImage: null,
  sheetOpen: false,
  mapSheet: 'collapsed',
  saved: {},
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

export const useAppStore = create((set) => ({
  ...initial,
  __reset: () => set({ ...initial, capturedImage: null, saved: {}, noti: { ...initial.noti }, mPick: {}, wPick: {}, mChat: [], wChat: [] }),
  setLang: (lang) => set({ lang }),
  setCapturedImage: (img) => set({ capturedImage: img }),
  toggleSaved: (id) => set((s) => {
    const saved = { ...s.saved }
    if (saved[id]) delete saved[id]; else saved[id] = true
    return { saved }
  }),
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
    return { [key]: { ...s[key], [qIdx]: answerIdx } }
  }),
  resetQuiz: (surface) => set({ [`${surface}Pick`]: {} }),
}))
