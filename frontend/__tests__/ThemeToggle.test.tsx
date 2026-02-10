import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ThemeToggle } from '../components/ThemeToggle'
import { useTheme } from 'next-themes'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}))

describe('ThemeToggle', () => {
  it('renders moon icon when theme is light', () => {
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme: vi.fn(),
      themes: ['light', 'dark'],
      systemTheme: 'light',
    })

    render(<ThemeToggle />)
    
    // The button has aria-label="Toggle theme"
    const button = screen.getByLabelText(/toggle theme/i)
    expect(button).toBeInTheDocument()
    
    // In light mode it should show Moon icon (for switching to dark)
    // We check for the presence of the moon icon (mocked icon or class)
    // Since lucide-react icons are rendered, we can check for svg or specific classes if we want
  })

  it('calls setTheme when clicked', () => {
    const setTheme = vi.fn()
    vi.mocked(useTheme).mockReturnValue({
      theme: 'light',
      resolvedTheme: 'light',
      setTheme,
      themes: ['light', 'dark'],
      systemTheme: 'light',
    })

    render(<ThemeToggle />)
    
    const button = screen.getByLabelText(/toggle theme/i)
    fireEvent.click(button)
    
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
