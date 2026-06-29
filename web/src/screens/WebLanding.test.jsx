import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { WebLanding } from './WebLanding'
import { useAppStore } from '../store/useAppStore'

describe('WebLanding', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('워드마크를 보여준다', () => {
    render(<MemoryRouter><WebLanding /></MemoryRouter>)
    expect(screen.getByText(/옛봄/)).toBeInTheDocument()
  })
  it('업로드 드롭존을 보여준다 (갤러리 버튼 없음)', () => {
    render(<MemoryRouter><WebLanding /></MemoryRouter>)
    expect(screen.getByText(/끌어다 놓으세요/)).toBeInTheDocument()
    expect(screen.queryByText('갤러리 선택')).toBeNull()
  })
  it('파일 선택 시 /analyzing으로 이동한다', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/web']}>
        <Routes>
          <Route path="/web" element={<WebLanding />} />
          <Route path="/analyzing" element={<div>ANALYZING</div>} />
        </Routes>
      </MemoryRouter>
    )
    const input = container.querySelector('input[type=file]')
    fireEvent.change(input, { target: { files: [new File(['x'], 'p.png', { type: 'image/png' })] } })
    expect(await screen.findByText('ANALYZING')).toBeInTheDocument()
  })
})
