import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Footer from '../components/Footer'

describe('Footer', () => {
  it('renders correctly', () => {
    render(<Footer />)
    
    expect(screen.getByText(/© 2026 Folia/i)).toBeInTheDocument()
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument()
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument()
  })

  it('has correct links', () => {
    render(<Footer />)
    
    const privacyLink = screen.getByRole('link', { name: /privacy policy/i })
    const termsLink = screen.getByRole('link', { name: /terms of service/i })
    
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy')
    expect(termsLink).toHaveAttribute('href', '/terms-of-service')
  })
})
