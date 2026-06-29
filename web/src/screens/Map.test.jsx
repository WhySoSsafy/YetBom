import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MapScreen } from './Map'
import { useAppStore } from '../store/useAppStore'

// 실제 Leaflet은 jsdom에서 동작하지 않으므로 스텁으로 대체 (지도 외 UI만 검증)
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  useMap: () => ({ fitBounds: () => {} }),
}))
vi.mock('leaflet', () => ({ default: { divIcon: () => ({}), latLngBounds: () => ({}) } }))

describe('MapScreen', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('내 주변 문화유산 시트 제목을 보여준다', () => {
    render(<MemoryRouter><MapScreen /></MemoryRouter>)
    expect(screen.getByText(/내 주변 문화유산/)).toBeInTheDocument()
  })
})
