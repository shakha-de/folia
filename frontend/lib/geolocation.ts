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
    const providers = [
        async (): Promise<GeoLocation> => {
            const res = await fetch('https://ipwho.is/', {
                signal: AbortSignal.timeout(4000),
            });
            if (!res.ok) throw new Error('ipwho.is request failed');
            const data = await res.json();
            if (!data?.success) throw new Error('ipwho.is lookup failed');
            return {
                lat: data.latitude,
                lng: data.longitude,
                source: 'ip',
                city: data.city,
                country: data.country_code,
            };
        },
        async (): Promise<GeoLocation> => {
            const res = await fetch('https://ipapi.co/json/', {
                signal: AbortSignal.timeout(4000),
            });
            if (!res.ok) throw new Error('ipapi.co request failed');
            const data = await res.json();
            if (data?.error || typeof data?.latitude !== 'number' || typeof data?.longitude !== 'number') {
                throw new Error('ipapi.co lookup failed');
            }
            return {
                lat: data.latitude,
                lng: data.longitude,
                source: 'ip',
                city: data.city,
                country: data.country_code,
            };
        },
    ];

    for (const provider of providers) {
        try {
            return await provider();
        } catch {
            // try next provider
        }
    }

    throw new Error('IP lookup failed');
}

let _cached: GeoLocation | null = null;
// Caches the in-flight promise so concurrent callers share one GPS/IP lookup
// instead of each spawning their own.
let _inflight: Promise<GeoLocation | null> | null = null;

/**
 * Returns an estimated user location, or null if both GPS and IP lookup fail.
 * Priority: browser GPS → IP geolocation.
 * Result cached after first resolution; concurrent calls share a single lookup.
 */
export function getUserLocation(): Promise<GeoLocation | null> {
    if (_cached) return Promise.resolve(_cached);
    if (_inflight) return _inflight;

    _inflight = (async () => {
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
    })().finally(() => { _inflight = null; });

    return _inflight;
}

