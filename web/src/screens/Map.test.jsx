import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MapScreen } from './Map'
import { useAppStore } from '../store/useAppStore'

// 실제 Leaflet/클러스터/위키 네트워크는 jsdom에서 동작하지 않으므로 스텁으로 대체
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  useMap: () => ({ fitBounds: () => {}, setView: () => {} }),
}))
vi.mock('leaflet', () => ({ default: { divIcon: () => ({}), latLngBounds: () => ({}), marker: () => ({ on: () => {} }), markerClusterGroup: undefined } }))
vi.mock('leaflet.markercluster', () => ({}))
vi.mock('../data/useHeritages', () => ({ useHeritages: () => ({ list: [], count: 0, loading: false }) }))

describe('MapScreen', () => {
  beforeEach(() => useAppStore.getState().__reset())
  it('내 주변 문화유산 시트 제목을 보여준다', () => {
    render(<MemoryRouter><MapScreen /></MemoryRouter>)
    expect(screen.getAllByText(/내 주변 문화유산/).length).toBeGreaterThan(0)
  })
})
