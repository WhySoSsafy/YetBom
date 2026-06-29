import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LangToggle } from './LangToggle'
import { useAppStore } from '../store/useAppStore'

describe('LangToggle', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('언어를 선택하면 store가 바뀐다', () => {
    render(<LangToggle />)
    fireEvent.change(screen.getByLabelText('언어 선택'), { target: { value: 'ja' } })
    expect(useAppStore.getState().lang).toBe('ja')
  })
  it('5개 언어를 제공한다', () => {
    render(<LangToggle />)
    expect(screen.getByRole('option', { name: '日本語' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Español' })).toBeInTheDocument()
  })
})
