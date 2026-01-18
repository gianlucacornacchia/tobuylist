import { useEffect, useState } from 'react';
import { useStore } from '../store';

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
    loading: boolean;
}

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: true,
    });

    const setLocationPermission = useStore((state) => state.setLocationPermission);

    useEffect(() => {
        if (!navigator.geolocation) {
            setState({
                latitude: null,
                longitude: null,
                error: 'Geolocation is not supported by your browser',
                loading: false,
            });
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                    loading: false,
                });
                setLocationPermission('granted');
            },
            (error) => {
                setState({
                    latitude: null,
                    longitude: null,
                    error: error.message,
                    loading: false,
                });
                setLocationPermission('denied');
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 60000, // Cache position for 1 minute
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [setLocationPermission]);

    return state;
}

// Calculate distance between two coordinates in meters using Haversine formula
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Find the closest store to current position
export function findClosestStore(
    latitude: number,
    longitude: number,
    stores: Array<{ id: string; latitude: number; longitude: number; radius: number }>
): string | null {
    let closestStore: string | null = null;
    let minDistance = Infinity;

    for (const store of stores) {
        const distance = calculateDistance(latitude, longitude, store.latitude, store.longitude);

        // Check if within store radius
        if (distance <= store.radius && distance < minDistance) {
            minDistance = distance;
            closestStore = store.id;
        }
    }

    return closestStore;
}
