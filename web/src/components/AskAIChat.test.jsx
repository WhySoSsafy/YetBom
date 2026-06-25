import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AskAIChat } from './AskAIChat'

const suggestions = [{ ko: '화재는 왜 났나요?', en: 'why fire?' }]

describe('AskAIChat', () => {
  it('제안 질문 클릭 시 onSend를 호출한다', () => {
    const onSend = vi.fn()
    render(<AskAIChat chat={[]} suggestions={suggestions} lang="ko"
      input="" onInputChange={vi.fn()} onSend={onSend} />)
    fireEvent.click(screen.getByText('화재는 왜 났나요?'))
    expect(onSend).toHaveBeenCalledWith('화재는 왜 났나요?')
  })
  it('AI 메시지의 출처를 렌더링한다', () => {
    render(<AskAIChat chat={[{ role: 'ai', text: '답변', source: '출처 · X' }]}
      suggestions={[]} lang="ko" input="" onInputChange={vi.fn()} onSend={vi.fn()} />)
    expect(screen.getByText('출처 · X')).toBeInTheDocument()
  })
})
