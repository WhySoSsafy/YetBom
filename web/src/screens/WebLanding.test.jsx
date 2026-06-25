import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WebLanding } from './WebLanding'
import { useAppStore } from '../store/useAppStore'

describe('WebLanding', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('워드마크를 보여준다', () => {
    render(<WebLanding />)
    expect(screen.getByText(/다시봄/)).toBeInTheDocument()
  })
  it('업로드 드롭존을 보여준다 (갤러리 버튼 없음)', () => {
    render(<WebLanding />)
    expect(screen.getByText(/끌어다 놓으세요/)).toBeInTheDocument()
    expect(screen.queryByText('갤러리 선택')).toBeNull()
  })
})
