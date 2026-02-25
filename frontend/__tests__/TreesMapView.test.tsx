import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Leaflet mock ────────────────────────────────────────────────────────────
vi.mock('leaflet', () => {
    const divIcon = vi.fn(() => ({ className: '', html: '', iconSize: [28, 28] }))
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
// MapContainer renders its children; all others are lightweight stubs.
vi.mock('react-leaflet', () => {
    const MapContainer = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="map-container">{children}</div>
    )
    const TileLayer = () => <div data-testid="tile-layer" />
    const Marker = ({ position, children }: { position: [number, number]; children?: React.ReactNode }) => (
        <div data-testid="marker" data-lat={position[0]} data-lng={position[1]}>
            {children}
        </div>
    )
    const Popup = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="popup">{children}</div>
    )
    const useMap = () => ({
        setView: vi.fn(),
        invalidateSize: vi.fn(),
    })
    const useMapEvents = vi.fn()

    return { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents }
})

import TreesMapView from '../components/maps/TreesMapView'
import type { TreeDto } from '../lib/api'

// ── Helpers ─────────────────────────────────────────────────────────────────
function makeTree(overrides: Partial<TreeDto> = {}): TreeDto {
    return {
        publicId: 'tree-1',
        species: 'Quercus robur',
        commonName: 'English Oak',
        lat: 51.5,
        lng: 11.9,
        healthStatus: 'HEALTHY',
        soilMoistureLevel: 'MODERATE',
        metadata: {},
        ...overrides,
    }
}

const CENTER = { lat: 51.5, lng: 11.9 }

// ── Tests ────────────────────────────────────────────────────────────────────
describe('TreesMapView', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders without errors on initial mount (SSR guard active)', async () => {
        // The component uses a mounted guard to prevent Leaflet DOM access before
        // the client environment is ready. Verify no errors are thrown on render.
        await expect(
            act(async () => {
                render(<TreesMapView trees={[]} center={CENTER} />)
            })
        ).resolves.toBeUndefined()
    })

    it('renders the map container and tile layer after mount', async () => {
        await act(async () => {
            render(<TreesMapView trees={[]} center={CENTER} />)
        })
        expect(screen.getByTestId('map-container')).toBeInTheDocument()
        expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
    })

    it('renders no markers when the tree list is empty', async () => {
        await act(async () => {
            render(<TreesMapView trees={[]} center={CENTER} />)
        })
        expect(screen.queryAllByTestId('marker')).toHaveLength(0)
    })

    it('renders one marker per tree', async () => {
        const trees = [
            makeTree({ publicId: 'a', lat: 51.5, lng: 11.9 }),
            makeTree({ publicId: 'b', lat: 51.6, lng: 12.0 }),
            makeTree({ publicId: 'c', lat: 51.4, lng: 11.8 }),
        ]
        await act(async () => {
            render(<TreesMapView trees={trees} center={CENTER} />)
        })
        expect(screen.getAllByTestId('marker')).toHaveLength(3)
    })

    it('places each marker at the correct coordinates', async () => {
        const trees = [makeTree({ publicId: 'x', lat: 48.137, lng: 11.576 })]
        await act(async () => {
            render(<TreesMapView trees={trees} center={CENTER} />)
        })
        const marker = screen.getByTestId('marker')
        expect(marker).toHaveAttribute('data-lat', '48.137')
        expect(marker).toHaveAttribute('data-lng', '11.576')
    })

    it('renders the popup with the tree common name', async () => {
        const trees = [makeTree({ commonName: 'Silver Birch' })]
        await act(async () => {
            render(<TreesMapView trees={trees} center={CENTER} />)
        })
        expect(screen.getByText('Silver Birch')).toBeInTheDocument()
    })

    it('falls back to species when common name is empty', async () => {
        const trees = [makeTree({ commonName: '', species: 'Betula pendula' })]
        await act(async () => {
            render(<TreesMapView trees={trees} center={CENTER} />)
        })
        expect(screen.getByText('Betula pendula')).toBeInTheDocument()
    })

    it('renders a popup showing the health label for HEALTHY trees', async () => {
        const trees = [makeTree({ healthStatus: 'HEALTHY' })]
        await act(async () => {
            render(<TreesMapView trees={trees} center={CENTER} />)
        })
        expect(screen.getByText('Healthy')).toBeInTheDocument()
    })

    it('renders a popup showing "Critical" for DYING trees', async () => {
        const trees = [makeTree({ healthStatus: 'DYING' })]
        await act(async () => {
            render(<TreesMapView trees={trees} center={CENTER} />)
        })
        expect(screen.getByText('Critical')).toBeInTheDocument()
    })

    it('renders a popup showing soil moisture level', async () => {
        const trees = [makeTree({ soilMoistureLevel: 'DRY' })]
        await act(async () => {
            render(<TreesMapView trees={trees} center={CENTER} />)
        })
        expect(screen.getByText(/moistur.*dry/i)).toBeInTheDocument()
    })

    it('renders last-watered date in popup when provided', async () => {
        const trees = [makeTree({ lastWateredAt: '2026-02-20T10:00:00Z' })]
        await act(async () => {
            render(<TreesMapView trees={trees} center={CENTER} />)
        })
        expect(screen.getByText(/last watered/i)).toBeInTheDocument()
    })

    it('does not render last-watered line when field is absent', async () => {
        const trees = [makeTree({ lastWateredAt: undefined })]
        await act(async () => {
            render(<TreesMapView trees={trees} center={CENTER} />)
        })
        expect(screen.queryByText(/last watered/i)).not.toBeInTheDocument()
    })
})
