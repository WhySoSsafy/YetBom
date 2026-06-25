import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useAppStore } from '../store/useAppStore'

describe('BottomNav', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('카메라 FAB 클릭 시 sheetOpen을 연다', () => {
    render(<MemoryRouter><BottomNav /></MemoryRouter>)
    fireEvent.click(screen.getByTestId('camera-fab'))
    expect(useAppStore.getState().sheetOpen).toBe(true)
  })
})
