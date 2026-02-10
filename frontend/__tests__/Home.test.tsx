import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Home from '../app/page'

// Mock Header and Footer to simplify
vi.mock('@/components/Header', () => ({
  default: () => <header data-testid="mock-header">Header</header>,
}))
vi.mock('@/components/Footer', () => ({
  default: () => <footer data-testid="mock-footer">Footer</footer>,
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}))

describe('Home Page', () => {
  it('renders the hero section with main heading', () => {
    render(<Home />)
    
    expect(screen.getByText(/Revive our/i)).toBeInTheDocument()
    expect(screen.getByText(/Roots/i)).toBeInTheDocument()
    expect(screen.getByText(/Central Asia Initiative/i)).toBeInTheDocument()
  })

  it('renders the call to action buttons', () => {
    render(<Home />)
    
    expect(screen.getByRole('button', { name: /become guardian/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /learn more/i })).toBeInTheDocument()
  })

  it('renders the stats section', () => {
    render(<Home />)
    
    expect(screen.getByText(/Trees Saved/i)).toBeInTheDocument()
    expect(screen.getByText(/10,000\+/i)).toBeInTheDocument()
    expect(screen.getByText(/Active Guardians/i)).toBeInTheDocument()
  })
})
