import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { WebLanding } from './WebLanding'
import { useAppStore } from '../store/useAppStore'

describe('WebLanding', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('워드마크를 보여준다', () => {
    render(<MemoryRouter><WebLanding /></MemoryRouter>)
    expect(screen.getAllByText(/옛봄/).length).toBeGreaterThan(0)
  })
  it('큐레이션 데모 선택지를 보여준다 (사진 없이 체험)', () => {
    render(<MemoryRouter><WebLanding /></MemoryRouter>)
    // 숭례문 데모가 헤더와 데모 목록에 노출됨
    expect(screen.getAllByText(/숭례문/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/업로드/).length).toBeGreaterThan(0)
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
