import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterPage from '../app/register/page';

const registerMock = vi.fn();
const pushMock = vi.fn();
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    register: registerMock,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

describe('RegisterPage error toasts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows server message and errors in toast', async () => {
    registerMock.mockRejectedValue({
      response: {
        data: {
          message: 'Validation failed',
          errors: {
            email: 'must be a well-formed email address',
          },
        },
      },
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'ab' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123' } });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalled();
      expect(toastErrorMock).toHaveBeenCalled();
    });

    const toastMessage = toastErrorMock.mock.calls[0][0] as string;
    expect(toastMessage).toContain('Validation failed');
    expect(toastMessage).toContain('email: must be a well-formed email address');
  });
});
