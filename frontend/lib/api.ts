import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const normalizedApiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;
const API_URL = normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers = config.headers ?? {};
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});

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

export const fetchNearbyTrees = async (lat: number, lng: number, radiusMeters: number = 250): Promise<TreeDto[]> => {
    try {
        const response = await api.get<ApiResponse<TreeDto[]>>('/trees/nearby', {
            params: { lat, lng, radiusMeters },
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching nearby trees:", error);
        return [];
    }
};

export const fetchTreeStats = async (lat: number, lng: number, radiusMeters: number = 5000): Promise<TreeStats | null> => {
    try {
        const response = await api.get<ApiResponse<TreeStats>>('/trees/stats', {
            params: { lat, lng, radiusMeters },
        });
        return response.data.data;
    } catch (error) {
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

export default api;
