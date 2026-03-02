import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const normalizedApiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
const API_URL = normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`;

// ─── Module-level token cache ─────────────────────────────────────────────────
// Avoids a localStorage read on every outgoing request; kept in sync by
// setAccessToken(), which is the single write point for the access token.
let _accessToken: string | null =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

export function setAccessToken(token: string | null): void {
    _accessToken = token;
    if (typeof window === 'undefined') return;
    if (token === null) {
        localStorage.removeItem('accessToken');
    } else {
        localStorage.setItem('accessToken', token);
    }
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach Bearer token on every request (reads from module cache)
api.interceptors.request.use((config) => {
    if (_accessToken) {
        config.headers = config.headers ?? {};
        config.headers['Authorization'] = `Bearer ${_accessToken}`;
    }
    return config;
});

// ─── 401 → silent token refresh ──────────────────────────────────────────────
// If multiple requests fail with 401 simultaneously only one refresh call is
// made; the rest are queued and replayed once the new token arrives.
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function flushRefreshQueue(token: string) {
    refreshQueue.forEach(cb => cb(token));
    refreshQueue = [];
}

function clearAuthAndRedirect() {
    if (typeof window === 'undefined') return;
    setAccessToken(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.replace('/login');
}

api.interceptors.response.use(
    res => res,
    async error => {
        const original = error.config;

        // Only intercept 401s; skip auth endpoints and already-retried requests
        if (
            error.response?.status !== 401 ||
            original._retry ||
            original.url?.includes('/auth/')
        ) {
            return Promise.reject(error);
        }

        original._retry = true;

        const storedRefreshToken =
            typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

        if (!storedRefreshToken) {
            clearAuthAndRedirect();
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Another refresh is already in flight — queue and replay when done
            return new Promise<string>(resolve => { refreshQueue.push(resolve); })
                .then(newToken => {
                    original.headers['Authorization'] = `Bearer ${newToken}`;
                    return api(original);
                });
        }

        isRefreshing = true;

        try {
            const { data } = await axios.post<ApiResponse<{ token: string; refreshToken: string; user: UserDto }>>(
                `${API_URL}/auth/refresh-token`,
                { refreshToken: storedRefreshToken },
            );
            const { token: newToken, refreshToken: newRefreshToken, user: newUser } = data.data;

            setAccessToken(newToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('user', JSON.stringify(newUser));

            flushRefreshQueue(newToken);
            isRefreshing = false;

            original.headers['Authorization'] = `Bearer ${newToken}`;
            return api(original);
        } catch {
            isRefreshing = false;
            refreshQueue = [];
            clearAuthAndRedirect();
            return Promise.reject(error);
        }
    },
);

// Unified API Response structure
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: Record<string, string>;
    timestamp: string;
}

export interface TreeDto {
    publicId: string;
    species: string;
    commonName: string;
    lat: number;
    lng: number;
    soilMoistureLevel: 'DRY' | 'MODERATE' | 'WET';
    healthStatus: 'HEALTHY' | 'STRESSED' | 'DYING' | 'DEAD' | 'REMOVED';
    lastWateredAt?: string;
    nextWateringDue?: string;
    createdAt?: string;
    updatedAt?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: Record<string, any>;
}

export interface TreeStats {
    totalTrees: number;
    treesBySpecies: Record<string, number>;
    treesByHealth: Record<string, number>;
    treesBySoilMoisture: Record<string, number>;
    treesNeedingWater: number;
    generatedAt: string;
}

export interface UserDto {
    uuid: string;
    username: string;
    email: string;
    role: string;
    enabled: boolean;
}

export interface UserBadgeDto {
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
}

export interface UserStatsDto {
    xp: number;
    rank: string;
    nextRank: string;
    xpToNextRank: number;
    progressPercent: number;
    treesRegistered: number;
    wateringsLogged: number;
    currentWateringsStreak: number;
    co2OffsetKg: number;
    unlockedBadges: Record<string, UserBadgeDto>;
}

export interface LeaderboardEntryDto {
    position: number;
    username: string;
    xp: number;
    rank: string;
}

export interface UserProfileDto extends UserDto {
    displayName?: string | null;
    bio?: string | null;
    profileImageUrl?: string | null;
    stats: UserStatsDto;
    leaderboardPosition: number;
}

export interface PageDto<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

export const fetchNearbyTrees = async (lat: number, lng: number, radiusMeters: number = 250, signal?: AbortSignal): Promise<TreeDto[]> => {
    try {
        const response = await api.get<ApiResponse<TreeDto[]>>('/trees/nearby', {
            params: { lat, lng, radiusMeters },
            signal,
        });
        return response.data.data;
    } catch (error) {
        if ((error as { name?: string }).name === 'CanceledError' || (error as { name?: string }).name === 'AbortError') return [];
        console.error("Error fetching nearby trees:", error);
        return [];
    }
};

export const fetchMyTrees = async (): Promise<TreeDto[]> => {
    try {
        const response = await api.get<ApiResponse<TreeDto[]>>('/trees');
        return response.data.data;
    } catch (error) {
        console.error("Error fetching my trees:", error);
        return [];
    }
};

export const fetchTreeStats = async (lat: number, lng: number, radiusMeters: number = 5000, signal?: AbortSignal): Promise<TreeStats | null> => {
    try {
        const response = await api.get<ApiResponse<TreeStats>>('/trees/stats', {
            params: { lat, lng, radiusMeters },
            signal,
        });
        return response.data.data;
    } catch (error) {
        if ((error as { name?: string }).name === 'CanceledError' || (error as { name?: string }).name === 'AbortError') return null;
        console.error("Error fetching tree stats:", error);
        return null;
    }
};

export type HealthStatus = 'HEALTHY' | 'STRESSED' | 'DYING' | 'DEAD' | 'REMOVED';
export type SoilMoistureLevel = 'DRY' | 'MODERATE' | 'WET';

export interface CreateTreeDto {
    species: string;
    commonName: string;
    lat: number;
    lng: number;
    soilMoistureLevel: SoilMoistureLevel;
    healthStatus: HealthStatus;
    metadata?: Record<string, unknown>;
}

export const createTree = async (data: CreateTreeDto): Promise<TreeDto | null> => {
    try {
        const response = await api.post<ApiResponse<TreeDto>>('/trees', data);
        return response.data.data;
    } catch (error) {
        console.error('Error creating tree:', error);
        return null;
    }
};

export const fetchUserProfile = async (username: string): Promise<UserProfileDto | null> => {
    try {
        const response = await api.get<ApiResponse<UserProfileDto>>(`/users/${encodeURIComponent(username)}/profile`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};

export const fetchLeaderboard = async (page: number = 0, size: number = 5): Promise<LeaderboardEntryDto[]> => {
    try {
        const response = await api.get<ApiResponse<PageDto<LeaderboardEntryDto>>>('/users/leaderboard', {
            params: { page, size },
        });
        return response.data.data.content;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }
};

export default api;
