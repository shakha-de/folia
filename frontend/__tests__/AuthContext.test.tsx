import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '../context/AuthContext'
import api from '../lib/api'

// Test-fixture credential – not a real password
const TEST_FIXTURE_PASSWORD = 'test-password-fixture'

// Mock api
vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>()
  return {
    ...actual,
    default: {
      ...actual.default,
      post: vi.fn(),
    },
  }
})

// Test component to access useAuth
const TestComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth()
  return (
    <div>
      <div data-testid="user">{user?.username || 'no user'}</div>
      <div data-testid="auth">{isAuthenticated.toString()}</div>
      <button onClick={() => login({ username: 'test', password: TEST_FIXTURE_PASSWORD })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('provides initial state from localStorage', () => {
    const mockUser = { username: 'stored' }
    localStorage.setItem('user', JSON.stringify(mockUser))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('user')).toHaveTextContent('stored')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
  })

  it('handles login successfully', async () => {
    const mockUserData = { username: 'newuser' }
    vi.mocked(api.post).mockResolvedValue({
      data: {
        data: {
          token: 'token',
          refreshToken: 'refresh',
          user: mockUserData,
        },
      },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginButton = screen.getByText('Login')
    await act(async () => {
      loginButton.click()
    })

    expect(api.post).toHaveBeenCalledWith('/auth/login', expect.anything())
    expect(screen.getByTestId('user')).toHaveTextContent('newuser')
    expect(localStorage.getItem('accessToken')).toBe('token')
  })

  it('handles logout', () => {
    localStorage.setItem('user', JSON.stringify({ username: 'test' }))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const logoutButton = screen.getByText('Logout')
    act(() => {
      logoutButton.click()
    })

    expect(screen.getByTestId('user')).toHaveTextContent('no user')
    expect(localStorage.getItem('user')).toBeNull()
  })
})
