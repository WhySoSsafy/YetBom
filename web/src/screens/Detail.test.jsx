import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
  it('즐겨찾기 버튼이 저장 상태를 토글한다', () => {
    renderDetail()
    const btn = screen.getByLabelText('즐겨찾기')
    expect(btn).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(btn)
    expect(useAppStore.getState().saved.sungnyemun).toBe(true)
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })
})
