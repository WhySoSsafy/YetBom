import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LangToggle } from './LangToggle'
import { useAppStore } from '../store/useAppStore'

describe('LangToggle', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('EN 클릭 시 언어가 en으로 바뀐다', () => {
    render(<LangToggle />)
    fireEvent.click(screen.getByText('EN'))
    expect(useAppStore.getState().lang).toBe('en')
  })
})
