import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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
    location: {
        x: number; // lng
        y: number; // lat
        coordinates?: number[];
    } | { lat: number; lng: number }; // adjust based on actual API response for Point
    soilMoistureLevel: 'DRY' | 'MODERATE' | 'WET';
    healthStatus: 'HEALTHY' | 'NEEDS_CARE' | 'CRITICAL';
    lastWateredAt?: string;
    nextWateringDue?: string;
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

export default api;
