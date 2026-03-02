import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UsernameProfilePage from '../app/u/[username]/page';

const replaceMock = vi.fn();
const fetchUserProfileMock = vi.fn();
const fetchLeaderboardMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
  useParams: () => ({ username: 'alice' }),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uuid: 'u-1',
      username: 'alice',
      email: 'alice@example.com',
      role: 'CITIZEN',
      enabled: true,
    },
    loading: false,
  }),
}));

vi.mock('@/components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/lib/api', () => ({
  fetchUserProfile: (...args: unknown[]) => fetchUserProfileMock(...args),
  fetchLeaderboard: (...args: unknown[]) => fetchLeaderboardMock(...args),
}));

describe('UsernameProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchUserProfileMock.mockResolvedValue({
      uuid: 'u-1',
      username: 'alice',
      email: 'alice@example.com',
      role: 'CITIZEN',
      enabled: true,
      displayName: 'Alice A.',
      bio: 'Tree guardian',
      profileImageUrl: null,
      leaderboardPosition: 4,
      stats: {
        xp: 420,
        rank: 'Sapling Steward',
        nextRank: 'Branch Guardian',
        xpToNextRank: 580,
        progressPercent: 42,
        treesRegistered: 6,
        wateringsLogged: 20,
        currentWateringsStreak: 3,
        co2OffsetKg: 18,
        unlockedBadges: {
          planter: { id: 'planter', name: 'Planter', icon: 'forest', unlocked: true },
        },
      },
    });
    fetchLeaderboardMock.mockResolvedValue([
      { position: 1, username: 'bob', xp: 800, rank: 'Branch Guardian' },
      { position: 2, username: 'alice', xp: 420, rank: 'Sapling Steward' },
    ]);
  });

  it('renders profile content for username route', async () => {
    render(<UsernameProfilePage />);

    await waitFor(() => {
      expect(fetchUserProfileMock).toHaveBeenCalledWith('alice');
      expect(fetchLeaderboardMock).toHaveBeenCalledWith(0, 5);
    });

    expect(screen.getByText(/Welcome back, Alice A\./i)).toBeInTheDocument();
    expect(screen.getByText('Total XP')).toBeInTheDocument();
    expect(screen.getByText('420')).toBeInTheDocument();
    expect(screen.getByText('Local Guardians')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });
});
