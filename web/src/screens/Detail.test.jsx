import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Detail } from './Detail'
import { useAppStore } from '../store/useAppStore'

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/detail/sungnyemun']}>
      <Routes><Route path="/detail/:id" element={<Detail />} /></Routes>
    </MemoryRouter>
  )
}

describe('Detail', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('복원 전·후 비교 섹션을 보여준다', () => {
    renderDetail()
    expect(screen.getByText('복원 전·후 비교')).toBeInTheDocument()
  })
  it('퀴즈 섹션을 보여준다', () => {
    renderDetail()
    expect(screen.getByText('퀴즈')).toBeInTheDocument()
  })
})
