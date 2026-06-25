import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { Switch } from './Switch'

describe('Switch', () => {
  it('클릭 시 onChange(!on)을 호출한다', () => {
    const onChange = vi.fn()
    const { container } = render(<Switch on={false} onChange={onChange} />)
    fireEvent.click(container.firstChild)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
