import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Analyzing } from './Analyzing'

describe('Analyzing', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())
  it('분석 타이틀을 보여준다', () => {
    render(<MemoryRouter><Analyzing /></MemoryRouter>)
    expect(screen.getByText('AI가 분석하고 있어요')).toBeInTheDocument()
  })
})
