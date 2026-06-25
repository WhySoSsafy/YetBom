import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MapScreen } from './Map'
import { useAppStore } from '../store/useAppStore'

describe('MapScreen', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('내 주변 문화유산 시트 제목을 보여준다', () => {
    render(<MemoryRouter><MapScreen /></MemoryRouter>)
    expect(screen.getByText(/내 주변 문화유산/)).toBeInTheDocument()
  })
})
