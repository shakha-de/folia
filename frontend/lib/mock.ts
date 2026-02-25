// Test data
export interface UserGamification {
    rank: string;
    xp: number;
    nextRank: string;
    progress: number; // 0-100
    location: string;
    co2Offset: number;
    treeYears: number;
    badges: Badge[];
}

export interface Badge {
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    xp: number;
    avatarUrl: string;
    isCurrentUser?: boolean;
}

export const MOCK_GAMIFICATION: UserGamification = {
    rank: 'Seedling Saver',
    xp: 950,
    nextRank: 'Sapling Steward',
    progress: 80,
    location: 'Tashkent, Uzbekistan',
    co2Offset: 12.5,
    treeYears: 42,
    badges: [
        { id: '1', name: 'First Drop', icon: 'water_drop', unlocked: true },
        { id: '2', name: 'Summer Hero', icon: 'wb_sunny', unlocked: true },
        { id: '3', name: 'Community', icon: 'group', unlocked: true },
        { id: '4', name: 'Forester', icon: 'forest', unlocked: false },
        { id: '5', name: 'Expert', icon: 'star', unlocked: false },
        { id: '6', name: 'King', icon: 'crown', unlocked: false },
    ]
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, name: 'Jamshid K.', xp: 1240, avatarUrl: '' },
    { rank: 2, name: 'Malika T.', xp: 1100, avatarUrl: '' },
    { rank: 3, name: 'Aziz B.', xp: 920, avatarUrl: '' },
    // Current user will be inserted or highlighted separately
];

export const getGamificationForUser = (): UserGamification => {
    return MOCK_GAMIFICATION; // Return same mock for now
};
