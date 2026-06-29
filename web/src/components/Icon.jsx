const PATHS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  map: 'M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z',
  camera: 'M4 8h3l2-2h6l2 2h3v12H4V8zm8 3a4 4 0 100 8 4 4 0 000-8z',
  bookmark: 'M6 3h12v18l-6-4-6 4V3z',
  bell: 'M12 3a6 6 0 00-6 6v4l-2 3h16l-2-3V9a6 6 0 00-6-6zM9 19a3 3 0 006 0',
  location: 'M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 4a3 3 0 100 6 3 3 0 000-6z',
  sparkle: 'M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  play: 'M7 4v16l13-8L7 4z',
  pause: 'M7 4h4v16H7zM13 4h4v16h-4z',
  check: 'M4 12l5 5L20 6',
  close: 'M5 5l14 14M19 5L5 19',
  search: 'M11 4a7 7 0 105 12l5 5M11 4a7 7 0 010 14',
  palette: 'M12 3a9 9 0 100 18c1 0 2-1 2-2s-1-2-1-3 1-2 3-2h2a3 3 0 003-3c0-4-4-8-9-8z',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5',
  graduation: 'M12 4L2 9l10 5 10-5-10-5zM6 11v5c0 1 3 3 6 3s6-2 6-3v-5',
  trophy: 'M6 4h12v3a6 6 0 01-12 0V4zM4 4h2M18 4h2M9 17h6v3H9z',
}

export function Icon({ name, size = 24, fill = 'none' }) {
  const d = PATHS[name]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d ? <path d={d} /> : <circle cx="12" cy="12" r="9" />}
    </svg>
  )
}
