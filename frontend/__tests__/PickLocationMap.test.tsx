import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Capture the last click handler registered by ClickHandler so tests can fire it.
let capturedClickHandler: ((e: { latlng: { lat: number; lng: number } }) => void) | null = null

// ── Leaflet mock ────────────────────────────────────────────────────────────
vi.mock('leaflet', () => {
    const divIcon = vi.fn(() => ({ className: '', html: '', iconSize: [32, 46] }))
    const mergeOptions = vi.fn()
    const IconDefault = function () {}
    IconDefault.prototype = {}
    IconDefault.mergeOptions = mergeOptions
    return {
        default: {
            Icon: { Default: IconDefault },
            divIcon,
            mergeOptions,
        },
    }
})

// ── react-leaflet mock ──────────────────────────────────────────────────────
vi.mock('react-leaflet', () => {
    const { useEffect } = require('react')

    const MapContainer = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="map-container">{children}</div>
    )
    const TileLayer = () => <div data-testid="tile-layer" />
    const Marker = ({ position, children }: { position: [number, number]; children?: React.ReactNode }) => (
        <div data-testid="marker" data-lat={position[0]} data-lng={position[1]}>
            {children}
        </div>
    )
    const useMap = () => ({
        setView: vi.fn(),
        invalidateSize: vi.fn(),
    })

    // Capture the handlers so tests can simulate map clicks
    const useMapEvents = vi.fn((handlers: Record<string, Function>) => {
        capturedClickHandler = handlers.click as (e: { latlng: { lat: number; lng: number } }) => void
        return null
    })

    return { MapContainer, TileLayer, Marker, useMap, useMapEvents }
})

import PickLocationMap from '../components/maps/PickLocationMap'

const DEFAULT_PROPS = {
    lat: 51.524,
    lng: 11.994,
    onLocationChange: vi.fn(),
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('PickLocationMap', () => {
    beforeEach(() => {
        capturedClickHandler = null
        vi.clearAllMocks()
    })

    it('renders without errors on initial mount (SSR guard active)', async () => {
        // The component uses a mounted guard to prevent Leaflet DOM access before
        // the client environment is ready. Verify no errors are thrown on render.
        await expect(
            act(async () => {
                render(<PickLocationMap {...DEFAULT_PROPS} />)
            })
        ).resolves.toBeUndefined()
    })

    it('renders the map container and tile layer after mount', async () => {
        await act(async () => {
            render(<PickLocationMap {...DEFAULT_PROPS} />)
        })
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
        expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
    })

    it('renders exactly one marker at the given coordinates', async () => {
        await act(async () => {
            render(<PickLocationMap {...DEFAULT_PROPS} lat={48.137} lng={11.576} onLocationChange={vi.fn()} />)
        })
        const marker = screen.getByTestId('marker')
        expect(marker).toHaveAttribute('data-lat', '48.137')
        expect(marker).toHaveAttribute('data-lng', '11.576')
    })

    it('marker moves when lat/lng props change', async () => {
        const onLocationChange = vi.fn()
        const { rerender } = await act(async () =>
            render(<PickLocationMap lat={51.0} lng={10.0} onLocationChange={onLocationChange} />)
        )
        expect(screen.getByTestId('marker')).toHaveAttribute('data-lat', '51')

        await act(async () => {
            rerender(<PickLocationMap lat={52.5} lng={13.4} onLocationChange={onLocationChange} />)
        })
        expect(screen.getByTestId('marker')).toHaveAttribute('data-lat', '52.5')
    })

    it('calls onLocationChange with clicked coordinates', async () => {
        const onLocationChange = vi.fn()
        await act(async () => {
            render(<PickLocationMap {...DEFAULT_PROPS} onLocationChange={onLocationChange} />)
        })

        expect(capturedClickHandler).not.toBeNull()
        act(() => {
            capturedClickHandler!({ latlng: { lat: 53.0, lng: 14.0 } })
        })

        expect(onLocationChange).toHaveBeenCalledOnce()
        expect(onLocationChange).toHaveBeenCalledWith(53.0, 14.0)
    })

    it('calls onLocationChange with different click coordinates', async () => {
        const onLocationChange = vi.fn()
        await act(async () => {
            render(<PickLocationMap {...DEFAULT_PROPS} onLocationChange={onLocationChange} />)
        })

        act(() => {
            capturedClickHandler!({ latlng: { lat: 48.8566, lng: 2.3522 } }) // Paris
        })

        expect(onLocationChange).toHaveBeenCalledWith(48.8566, 2.3522)
    })

    it('fires onLocationChange every time the map is clicked', async () => {
        const onLocationChange = vi.fn()
        await act(async () => {
            render(<PickLocationMap {...DEFAULT_PROPS} onLocationChange={onLocationChange} />)
        })

        act(() => { capturedClickHandler!({ latlng: { lat: 1, lng: 2 } }) })
        act(() => { capturedClickHandler!({ latlng: { lat: 3, lng: 4 } }) })
        act(() => { capturedClickHandler!({ latlng: { lat: 5, lng: 6 } }) })

        expect(onLocationChange).toHaveBeenCalledTimes(3)
    })
})
