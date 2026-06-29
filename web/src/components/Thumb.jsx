import { useState } from 'react'

// 썸네일 이미지. src가 없거나 로딩 실패하면 앱 로고(✦) 브랜드 placeholder로 대체(깨진 이미지 방지).
export function Thumb({ src, className = '', style, alt = '' }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-primary to-primary-heavy text-white ${className}`} style={style}>
        <span className="font-bold leading-none" style={{ fontSize: '1.5em' }}>✦</span>
        <span className="font-semibold leading-none opacity-90" style={{ fontSize: '0.42em' }}>옛봄</span>
      </div>
    )
  }
  return <img src={src} alt={alt} onError={() => setErr(true)} className={className} style={style} />
}
