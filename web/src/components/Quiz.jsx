import { copy, tr } from '../data/copy'

export function Quiz({ questions, lang, picks, onPick, onReset }) {
  const t = copy[lang] || copy.en
  const answered = Object.keys(picks).length
  const allDone = answered === questions.length
  const score = questions.reduce((acc, q, i) => acc + (picks[i] === q.answer ? 1 : 0), 0)

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => {
        const picked = picks[qi]
        const isAnswered = picked !== undefined
        return (
          <div key={qi}>
            <div className="font-semibold text-[15px] mb-2">{qi + 1}. {tr(q.q, lang)}</div>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                let cls = 'bg-black/5 text-black/80'
                if (isAnswered) {
                  if (oi === q.answer) cls = 'bg-green-100 text-green-700 border border-green-400'
                  else if (oi === picked) cls = 'bg-red-100 text-red-700 border border-red-400'
                  else cls = 'bg-black/5 text-black/30'
                }
                return (
                  <button key={oi} disabled={isAnswered} onClick={() => onPick(qi, oi)}
                    className={`w-full text-left px-3 py-2 rounded-btn text-[14px] ${cls}`}>{tr(opt, lang)}</button>
                )
              })}
            </div>
            {isAnswered && <p className="mt-2 text-[13px] text-black/60">{tr(q.explain, lang)}</p>}
          </div>
        )
      })}
      {allDone && (
        <div className="flex items-center justify-between pt-2">
          <span className="font-bold text-primary">{score} / {questions.length}</span>
          <button onClick={onReset} className="px-3 py-2 rounded-btn bg-black/5 text-[13px]">
            {t.quizRetry}
          </button>
        </div>
      )}
    </div>
  )
}
