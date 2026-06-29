import { useState } from 'react'

// 썸네일 이미지. src가 없거나 로딩 실패하면 앱 로고(✦) 브랜드 placeholder로 대체(깨진 이미지 방지).
export function Thumb({ src, className = '', style, alt = '' }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5 ${className}`} style={style}>
        <img src="/logo.png" alt="" className="w-1/2 h-1/2 object-contain opacity-90" />
      </div>
    )
  }
  return <img src={src} alt={alt} onError={() => setErr(true)} className={className} style={style} />
}
