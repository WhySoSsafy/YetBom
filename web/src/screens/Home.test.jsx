import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Home } from './Home'
import { useAppStore } from '../store/useAppStore'

describe('Home', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('추천 문화유산 섹션 제목을 보여준다', () => {
    render(<MemoryRouter><Home /></MemoryRouter>)
    expect(screen.getByText('추천 문화유산')).toBeInTheDocument()
  })
})
