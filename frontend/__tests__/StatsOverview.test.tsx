import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatsOverview from '../components/dashboard/StatsOverview'

describe('StatsOverview', () => {
  it('renders nothing when stats are null', () => {
    const { container } = render(<StatsOverview stats={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders stats correctly when provided', () => {
    const mockStats = {
      totalTrees: 150,
      treesNeedingWater: 12,
      lastUpdate: '2026-02-09',
    } as any

    render(<StatsOverview stats={mockStats} />)
    
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText(/Trees Registered/i)).toBeInTheDocument()
    expect(screen.getByText(/Waterings Logged/i)).toBeInTheDocument()
  })
})
