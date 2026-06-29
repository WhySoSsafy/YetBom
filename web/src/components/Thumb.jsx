import { useState } from 'react'

// 썸네일 이미지. src가 없거나 로딩 실패하면 이름 첫 글자 placeholder로 대체(깨진 이미지 방지).
export function Thumb({ src, label = '', className = '', style, alt = '' }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary/25 to-primary/5 text-primary font-bold ${className}`} style={style}>
        {label.slice(0, 1) || '✦'}
      </div>
    )
  }
  return <img src={src} alt={alt} onError={() => setErr(true)} className={className} style={style} />
}
