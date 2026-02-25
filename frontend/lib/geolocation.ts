export interface GeoLocation {
    lat: number;
    lng: number;
    source: 'gps' | 'ip';
    city?: string;
    country?: string;
}

function fromBrowserGPS(): Promise<GeoLocation> {
    return new Promise((resolve, reject) => {
        if (!navigator?.geolocation) {
            reject(new Error('Geolocation API not available'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'gps' }),
            (err) => reject(err),
            { timeout: 5000, maximumAge: 60_000 }
        );
    });
}

async function fromIP(): Promise<GeoLocation> {
    // ip-api.com — free, no key required
    const res = await fetch('https://ip-api.com/json/?fields=status,lat,lon,city,country,countryCode', {
        signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    if (data.status !== 'success') throw new Error('IP lookup failed');
    return {
        lat: data.lat,
        lng: data.lon,
        source: 'ip',
        city: data.city,
        country: data.countryCode,
    };
}

let _cached: GeoLocation | null = null;

/**
 * Returns an estimated user location, or null if both GPS and IP lookup fail.
 * Priority: browser GPS → IP geolocation.
 * Result is cached for the session.
 */
export async function getUserLocation(): Promise<GeoLocation | null> {
    if (_cached) return _cached;
    try {
        _cached = await fromBrowserGPS();
        return _cached;
    } catch {
        // GPS denied or timed out — try IP
    }
    try {
        _cached = await fromIP();
        return _cached;
    } catch {
        // Both failed
    }
    return null;
}

