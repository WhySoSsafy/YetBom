import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommentaryPlayer } from './CommentaryPlayer'

const modes = [
  { key: '30s', label: { ko: '30초 요약', en: '30s' }, text: { ko: '요약본', en: 'summary' } },
  { key: 'kids', label: { ko: '어린이', en: 'Kids' }, text: { ko: '쉬운 설명', en: 'easy' } },
]

describe('CommentaryPlayer', () => {
  it('활성 모드의 본문을 보여준다', () => {
    render(<CommentaryPlayer modes={modes} lang="ko" activeMode="30s"
      onModeChange={vi.fn()} play={false} progress={0} speed={1}
      onPlayToggle={vi.fn()} onSpeedChange={vi.fn()} />)
    expect(screen.getByText('요약본')).toBeInTheDocument()
  })
  it('다른 칩 클릭 시 onModeChange를 호출한다', () => {
    const onModeChange = vi.fn()
    render(<CommentaryPlayer modes={modes} lang="ko" activeMode="30s"
      onModeChange={onModeChange} play={false} progress={0} speed={1}
      onPlayToggle={vi.fn()} onSpeedChange={vi.fn()} />)
    fireEvent.click(screen.getByText('어린이'))
    expect(onModeChange).toHaveBeenCalledWith('kids')
  })
})
