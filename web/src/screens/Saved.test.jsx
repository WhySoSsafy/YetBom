import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Saved } from './Saved'
import { useAppStore } from '../store/useAppStore'

// 네트워크(위키데이터) 의존 제거
vi.mock('../data/useHeritages', () => ({ useHeritages: () => ({ list: [], count: 0, loading: false }) }))

describe('Saved', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('즐겨찾기 제목을 보여준다', () => {
    render(<MemoryRouter><Saved /></MemoryRouter>)
    expect(screen.getByText(/즐겨찾기/)).toBeInTheDocument()
  })
})
