import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BeforeAfterSlider } from './BeforeAfterSlider'

describe('BeforeAfterSlider', () => {
  it('before/after 라벨을 렌더링한다', () => {
    render(<BeforeAfterSlider beforeSrc="/b.png" afterSrc="/a.png" pos={50}
      onPosChange={vi.fn()} beforeLabel="화재 직후" afterLabel="복원 완료" />)
    expect(screen.getByText('화재 직후')).toBeInTheDocument()
    expect(screen.getByText('복원 완료')).toBeInTheDocument()
  })
  it('overlay에 clip-path inset이 pos에 따라 적용된다', () => {
    const { container } = render(<BeforeAfterSlider beforeSrc="/b.png" afterSrc="/a.png"
      pos={30} onPosChange={vi.fn()} beforeLabel="b" afterLabel="a" />)
    const overlay = container.querySelector('[data-overlay]')
    expect(overlay.style.clipPath).toBe('inset(0 70% 0 0)')
  })
})
