import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Onboarding } from './Onboarding'

describe('Onboarding', () => {
  it('온보딩 타이틀을 렌더링한다', () => {
    render(<MemoryRouter><Onboarding /></MemoryRouter>)
    expect(screen.getByText(/사라진 풍경/)).toBeInTheDocument()
  })
})
