import { describe, expect, it } from 'vitest';
import { extractApiErrorMessage } from '../lib/apiErrorMessage';

describe('extractApiErrorMessage', () => {
  it('combines API message with errors map values', () => {
    const error = {
      response: {
        data: {
          message: 'Validation failed',
          errors: {
            email: 'must be a well-formed email address',
            username: 'size must be between 3 and 50',
          },
        },
      },
    };

    const result = extractApiErrorMessage(error, 'Registration failed. Please try again.');

    expect(result).toContain('Validation failed');
    expect(result).toContain('email: must be a well-formed email address');
    expect(result).toContain('username: size must be between 3 and 50');
  });

  it('handles nested and array-based errors payloads', () => {
    const error = {
      response: {
        data: {
          message: 'Validation failed',
          errors: {
            fields: {
              password: ['too short', 'must contain number'],
            },
          },
        },
      },
    };

    const result = extractApiErrorMessage(error, 'fallback');

    expect(result).toContain('Validation failed');
    expect(result).toContain('fields: password: too short');
    expect(result).toContain('fields: password: must contain number');
  });

  it('falls back only when message and errors are missing', () => {
    const result = extractApiErrorMessage({}, 'Registration failed. Please try again.');
    expect(result).toBe('Registration failed. Please try again.');
  });
});
