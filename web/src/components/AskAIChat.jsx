import { Icon } from './Icon'
import { copy, tr } from '../data/copy'

export function AskAIChat({ chat, suggestions, lang, input, onInputChange, onSend }) {
  const t = copy[lang] || copy.en
  const submit = () => { if (input.trim()) onSend(input.trim()) }
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
      </div>
      {suggestions.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => onSend(tr(s, lang))}
              className="px-3 py-[6px] rounded-full bg-primary/10 text-primary text-[13px]">{tr(s, lang)}</button>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="flex-1 h-11 px-3 rounded-btn bg-black/5 text-[14px] outline-none"
          placeholder={t.askPlaceholder} />
        <button onClick={submit} className="w-11 h-11 rounded-btn bg-primary text-white flex items-center justify-center">
          <Icon name="chevron-right" size={18} />
        </button>
      </div>
    </div>
  )
}
