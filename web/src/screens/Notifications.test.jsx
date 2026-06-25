import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Notifications } from './Notifications'
import { useAppStore } from '../store/useAppStore'

describe('Notifications', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('알림 설정 타이틀을 보여준다', () => {
    render(<MemoryRouter><Notifications /></MemoryRouter>)
    expect(screen.getByText('알림 설정')).toBeInTheDocument()
  })
})
