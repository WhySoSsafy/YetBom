import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Quiz } from './Quiz'

const questions = [
  { q: { ko: '국보 번호?', en: 'no?' },
    options: [{ ko: '1호', en: '1' }, { ko: '2호', en: '2' }],
    answer: 0, explain: { ko: '1호입니다', en: 'it is 1' } },
]

describe('Quiz', () => {
  it('답 선택 시 onPick을 호출한다', () => {
    const onPick = vi.fn()
    render(<Quiz questions={questions} lang="ko" picks={{}} onPick={onPick} onReset={vi.fn()} />)
    fireEvent.click(screen.getByText('1호'))
    expect(onPick).toHaveBeenCalledWith(0, 0)
  })
  it('답한 뒤 설명을 보여준다', () => {
    render(<Quiz questions={questions} lang="ko" picks={{ 0: 0 }} onPick={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText('1호입니다')).toBeInTheDocument()
  })
  it('모두 답하면 점수를 보여준다', () => {
    render(<Quiz questions={questions} lang="ko" picks={{ 0: 0 }} onPick={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText(/1 \/ 1/)).toBeInTheDocument()
  })
})
