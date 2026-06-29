import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BeforeAfterSlider } from './BeforeAfterSlider'

describe('BeforeAfterSlider', () => {
  it('before/after 라벨을 렌더링한다', () => {
    render(<BeforeAfterSlider beforeSrc="/b.png" afterSrc="/a.png" pos={50}
      onPosChange={vi.fn()} beforeLabel="화재 직후" afterLabel="복원 완료" />)
    expect(screen.getByText('화재 직후')).toBeInTheDocument()
    expect(screen.getByText('복원 완료')).toBeInTheDocument()
  })
  it('자동 데모는 1/3(33%) 지점에서 시작한다', () => {
    const { container } = render(<BeforeAfterSlider beforeSrc="/b.png" afterSrc="/a.png"
      pos={50} onPosChange={vi.fn()} beforeLabel="b" afterLabel="a" />)
    const overlay = container.querySelector('[data-overlay]')
    // hinting 상태에서 데모 시작값 33% → inset 67%
    expect(overlay.style.clipPath).toBe('inset(0 67% 0 0)')
  })
  it('상호작용 후에는 clip-path가 pos를 따른다', () => {
    const { container } = render(<BeforeAfterSlider beforeSrc="/b.png" afterSrc="/a.png"
      pos={30} onPosChange={vi.fn()} beforeLabel="b" afterLabel="a" />)
    fireEvent.pointerDown(container.querySelector('.cursor-ew-resize'), { clientX: 0 })
    const overlay = container.querySelector('[data-overlay]')
    expect(overlay.style.clipPath).toBe('inset(0 70% 0 0)')
  })
})
