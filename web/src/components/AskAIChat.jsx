import { useState } from 'react'
import { Icon } from './Icon'
import { copy, tr } from '../data/copy'

export function AskAIChat({ chat, suggestions, lang, input, onInputChange, onSend }) {
  const t = copy[lang] || copy.en
  const [sending, setSending] = useState(false)

  const send = async (q) => {
    const text = (q ?? '').trim()
    if (sending || !text) return
    setSending(true)
    onInputChange('') // 전송 후 입력창 비우기
    try { await onSend(text) } finally { setSending(false) }
  }

  return (
    <div>
      <div className="space-y-3">
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[14px] ${
              m.role === 'user' ? 'bg-primary text-white' : 'bg-black/5 text-black/85'
            }`}>
              <div>{m.text}</div>
              {m.source && <div className="mt-1 text-[11px] opacity-70">{m.source}</div>}
            </div>
          </div>
        ))}
        {/* 답변 대기 중 타이핑 표시 */}
        {sending && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-2xl bg-black/5 flex items-center gap-1">
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-1.5 h-1.5 rounded-full bg-black/40 animate-dbpulse" style={{ animationDelay: `${d * 0.18}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>
      {suggestions.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {suggestions.map((sg, i) => (
            <button key={i} onClick={() => send(tr(sg, lang))} disabled={sending}
              className="px-3 py-[6px] rounded-full bg-primary/10 text-primary text-[13px] disabled:opacity-40">{tr(sg, lang)}</button>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)} disabled={sending}
          className="flex-1 h-11 px-3 rounded-btn bg-black/5 text-[14px] outline-none disabled:opacity-60"
          placeholder={t.askPlaceholder} />
        <button onClick={() => send(input)} disabled={sending} aria-busy={sending}
          className="w-11 h-11 rounded-btn bg-primary text-white flex items-center justify-center disabled:opacity-60">
          {sending
            ? <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-dbspin" />
            : <Icon name="chevron-right" size={18} />}
        </button>
      </div>
    </div>
  )
}
