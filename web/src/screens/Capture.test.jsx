import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Capture } from './Capture'
import { useAppStore } from '../store/useAppStore'

describe('Capture', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('캡처 타이틀을 보여준다', () => {
    render(<MemoryRouter><Capture /></MemoryRouter>)
    expect(screen.getByText(/문화유산/)).toBeInTheDocument()
  })
  it('파일 선택 시 캡처 이미지를 저장하고 /analyzing으로 이동한다', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/capture']}>
        <Routes>
          <Route path="/capture" element={<Capture />} />
          <Route path="/analyzing" element={<div>ANALYZING</div>} />
        </Routes>
      </MemoryRouter>
    )
    const input = container.querySelector('input[type=file]')
    fireEvent.change(input, { target: { files: [new File(['x'], 'p.png', { type: 'image/png' })] } })
    expect(await screen.findByText('ANALYZING')).toBeInTheDocument()
    expect(useAppStore.getState().capturedImage).toBeTruthy()
  })
})
