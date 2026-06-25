import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BottomSheet } from './BottomSheet'

describe('BottomSheet', () => {
  it('핸들 클릭 시 onToggle을 호출한다', () => {
    const onToggle = vi.fn()
    render(<BottomSheet open state="collapsed" collapsedH={150} expandedH={402}
      onToggle={onToggle} title="내 주변"><div>list</div></BottomSheet>)
    fireEvent.click(screen.getByTestId('sheet-handle'))
    expect(onToggle).toHaveBeenCalled()
  })
})
