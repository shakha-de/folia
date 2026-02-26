/**
 * MapMountGuard.test.tsx
 *
 * Verifies that PickLocationMap and TreesMapView render correctly.
 *
 * WHY Strict Mode is disabled in next.config.ts (reactStrictMode: false):
 *   React 19 Strict Mode calls `reappearLayoutEffects` to re-run all layout
 *   effects on the existing fiber tree — WITHOUT triggering a re-render.
 *   TileLayer / Marker layout effects therefore re-run AFTER MapContainer's
 *   cleanup has called map.remove() and destroyed its panes. Any call to
 *   getPane() inside those effects throws. No state-based mounted guard can
 *   prevent this because the guard lives in the render phase, which
 *   reappearLayoutEffects bypasses entirely.
 *   Disabling Strict Mode is the accepted solution – it only affects
 *   development builds; production React never double-invokes effects.
 *
 * These tests run WITHOUT <StrictMode> (matching the app's config).
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Leaflet mock ────────────────────────────────────────────────────────────
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

// ─── react-leaflet mock ──────────────────────────────────────────────────────
let capturedClickHandler: ((e: { latlng: { lat: number; lng: number } }) => void) | null = null

vi.mock('react-leaflet', () => {
    const MapContainer = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="map-container">{children}</div>
    )
    const TileLayer = () => <div data-testid="tile-layer" />
    const Marker = ({
        position,
        children,
    }: {
        position: [number, number]
        children?: React.ReactNode
    }) => (
        <div data-testid="marker" data-lat={position[0]} data-lng={position[1]}>
            {children}
        </div>
    )
    const Popup = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="popup">{children}</div>
    )
    const useMap = () => ({
        setView: vi.fn(),
        flyTo: vi.fn(),
        invalidateSize: vi.fn(),
        getCenter: vi.fn(() => ({ lat: 52.52, lng: 13.405 })),
        getBounds: vi.fn(() => ({
            getNorthWest: vi.fn(() => ({ lat: 52.53, lng: 13.39 })),
        })),
        distanceTo: vi.fn(() => 1000),
        on: vi.fn(),
        off: vi.fn(),
    })
    const useMapEvents = vi.fn(
        (handlers: Record<string, (...args: unknown[]) => unknown>) => {
            capturedClickHandler =
                handlers.click as (e: { latlng: { lat: number; lng: number } }) => void
            return null
        }
    )
    return { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents }
})

// ─── Component imports (must follow vi.mock calls) ───────────────────────────
import PickLocationMap from '../components/maps/PickLocationMap'
import TreesMapView from '../components/maps/TreesMapView'
import type { TreeDto } from '../lib/api'

// ─── Fixtures ────────────────────────────────────────────────────────────────
const DEFAULT_PICK_PROPS = { lat: 52.52, lng: 13.405, onLocationChange: vi.fn() }

const makeTree = (overrides: Partial<TreeDto> = {}): TreeDto => ({
    publicId: 'tree-1',
    lat: 52.52,
    lng: 13.405,
    species: 'Ulmus pumila',
    commonName: 'Siberian Elm',
    healthStatus: 'HEALTHY',
    soilMoistureLevel: 'MODERATE',
    lastWateredAt: null,
    ...overrides,
})

// ═══════════════════════════════════════════════════════════════════════════════
// PickLocationMap
// ═══════════════════════════════════════════════════════════════════════════════
describe('PickLocationMap', () => {
    beforeEach(() => {
        capturedClickHandler = null
        vi.clearAllMocks()
    })

    it('renders map-container and tile-layer', async () => {
        await act(async () => { render(<PickLocationMap {...DEFAULT_PICK_PROPS} />) })
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
        expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
    })

    it('renders a marker at the given coordinates', async () => {
        await act(async () => {
            render(<PickLocationMap lat={48.137} lng={11.576} onLocationChange={vi.fn()} />)
        })
        const marker = screen.getByTestId('marker')
        expect(marker).toHaveAttribute('data-lat', '48.137')
        expect(marker).toHaveAttribute('data-lng', '11.576')
    })

    it('marker position updates when lat/lng props change', async () => {
        const onLocationChange = vi.fn()
        let rerender!: (ui: React.ReactElement) => void
        await act(async () => {
            ;({ rerender } = render(
                <PickLocationMap lat={51.0} lng={10.0} onLocationChange={onLocationChange} />
            ))
        })
        expect(screen.getByTestId('marker')).toHaveAttribute('data-lat', '51')

        await act(async () => {
            rerender(<PickLocationMap lat={52.5} lng={13.4} onLocationChange={onLocationChange} />)
        })
        expect(screen.getByTestId('marker')).toHaveAttribute('data-lat', '52.5')
    })

    it('calls onLocationChange with clicked coordinates', async () => {
        const onLocationChange = vi.fn()
        await act(async () => {
            render(<PickLocationMap {...DEFAULT_PICK_PROPS} onLocationChange={onLocationChange} />)
        })
        expect(capturedClickHandler).not.toBeNull()
        act(() => { capturedClickHandler!({ latlng: { lat: 53.0, lng: 14.0 } }) })
        expect(onLocationChange).toHaveBeenCalledOnce()
        expect(onLocationChange).toHaveBeenCalledWith(53.0, 14.0)
    })

    it('fires onLocationChange for every map click', async () => {
        const onLocationChange = vi.fn()
        await act(async () => {
            render(<PickLocationMap {...DEFAULT_PICK_PROPS} onLocationChange={onLocationChange} />)
        })
        act(() => { capturedClickHandler!({ latlng: { lat: 1, lng: 2 } }) })
        act(() => { capturedClickHandler!({ latlng: { lat: 3, lng: 4 } }) })
        act(() => { capturedClickHandler!({ latlng: { lat: 5, lng: 6 } }) })
        expect(onLocationChange).toHaveBeenCalledTimes(3)
        expect(onLocationChange).toHaveBeenNthCalledWith(2, 3, 4)
    })

    it('survives unmount and remount cleanly', async () => {
        const onLocationChange = vi.fn()
        let unmount!: () => void
        await act(async () => {
            ;({ unmount } = render(
                <PickLocationMap {...DEFAULT_PICK_PROPS} onLocationChange={onLocationChange} />
            ))
        })
        expect(screen.getByTestId('map-container')).toBeInTheDocument()

        act(() => { unmount() })
        expect(screen.queryByTestId('map-container')).toBeNull()

        await act(async () => {
            render(<PickLocationMap {...DEFAULT_PICK_PROPS} onLocationChange={onLocationChange} />)
        })
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })
})

// ═══════════════════════════════════════════════════════════════════════════════
// TreesMapView
// ═══════════════════════════════════════════════════════════════════════════════
describe('TreesMapView', () => {
    const CENTER = { lat: 52.52, lng: 13.405 }

    beforeEach(() => { vi.clearAllMocks() })

    it('renders map-container and tile-layer with empty tree list', async () => {
        await act(async () => {
            render(<TreesMapView trees={[]} center={CENTER} onViewChange={vi.fn()} />)
        })
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
        expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
    })

    it('renders one marker per tree', async () => {
        const trees = [
            makeTree({ publicId: 'a', lat: 52.5, lng: 13.3 }),
            makeTree({ publicId: 'b', lat: 52.6, lng: 13.4 }),
            makeTree({ publicId: 'c', lat: 52.7, lng: 13.5 }),
        ]
        await act(async () => {
            render(<TreesMapView trees={trees} center={CENTER} onViewChange={vi.fn()} />)
        })
        expect(screen.getAllByTestId('marker')).toHaveLength(3)
    })

    it('renders markers at the correct coordinates', async () => {
        const tree = makeTree({ lat: 48.137, lng: 11.576 })
        await act(async () => {
            render(<TreesMapView trees={[tree]} center={CENTER} />)
        })
        const marker = screen.getByTestId('marker')
        expect(marker).toHaveAttribute('data-lat', '48.137')
        expect(marker).toHaveAttribute('data-lng', '11.576')
    })

    it('renders zero markers when tree list is empty', async () => {
        await act(async () => { render(<TreesMapView trees={[]} center={CENTER} />) })
        expect(screen.queryAllByTestId('marker')).toHaveLength(0)
    })

    it('updates markers when tree list prop changes', async () => {
        const onViewChange = vi.fn()
        let rerender!: (ui: React.ReactElement) => void
        await act(async () => {
            ;({ rerender } = render(
                <TreesMapView trees={[makeTree({ publicId: 'x' })]} center={CENTER} onViewChange={onViewChange} />
            ))
        })
        expect(screen.getAllByTestId('marker')).toHaveLength(1)

        await act(async () => {
            rerender(
                <TreesMapView
                    trees={[makeTree({ publicId: 'x' }), makeTree({ publicId: 'y' })]}
                    center={CENTER}
                    onViewChange={onViewChange}
                />
            )
        })
        expect(screen.getAllByTestId('marker')).toHaveLength(2)
    })

    it('survives unmount and remount cleanly', async () => {
        let unmount!: () => void
        await act(async () => {
            ;({ unmount } = render(<TreesMapView trees={[]} center={CENTER} />))
        })
        expect(screen.getByTestId('map-container')).toBeInTheDocument()

        act(() => { unmount() })
        expect(screen.queryByTestId('map-container')).toBeNull()

        await act(async () => { render(<TreesMapView trees={[]} center={CENTER} />) })
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
    })
})
