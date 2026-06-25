import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Identify } from './Identify'

describe('Identify', () => {
  it('식별 질문 타이틀을 보여준다', async () => {
    render(<MemoryRouter><Identify /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText('이 문화유산이 맞나요?')).toBeInTheDocument())
  })
  it('일치율을 보여준다', async () => {
    render(<MemoryRouter><Identify /></MemoryRouter>)
    await waitFor(() => expect(screen.getByText(/96/)).toBeInTheDocument())
  })
})
