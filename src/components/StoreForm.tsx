import { useState, useEffect } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { useGeolocation } from '../hooks/useGeolocation';
import type { Store } from '../types';

interface StoreFormProps {
    onClose: () => void;
    editingStore: Store | null;
}

export function StoreForm({ onClose, editingStore }: StoreFormProps) {
    const addStore = useStore((state) => state.addStore);
    const updateStore = useStore((state) => state.updateStore);
    const geolocation = useGeolocation();

    const [name, setName] = useState(editingStore?.name || '');
    const [latitude, setLatitude] = useState<number | null>(editingStore?.latitude || null);
    const [longitude, setLongitude] = useState<number | null>(editingStore?.longitude || null);
    const [radius, setRadius] = useState(editingStore?.radius || 100);

    // Auto-capture location when form opens (for new stores)
    useEffect(() => {
        if (!editingStore && geolocation.latitude && geolocation.longitude) {
            setLatitude(geolocation.latitude);
            setLongitude(geolocation.longitude);
        }
    }, [geolocation.latitude, geolocation.longitude, editingStore]);

    const handleUseCurrentLocation = () => {
        if (geolocation.latitude && geolocation.longitude) {
            setLatitude(geolocation.latitude);
            setLongitude(geolocation.longitude);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            alert('Please enter a store name');
            return;
        }

        if (latitude === null || longitude === null) {
            alert('Please capture your current location');
            return;
        }

        if (editingStore) {
            updateStore(editingStore.id, {
                name: name.trim(),
                latitude,
                longitude,
                radius,
            });
        } else {
            addStore({
                name: name.trim(),
                latitude,
                longitude,
                radius,
                visitCount: 0,
                lastVisit: 0,
            });
        }

        onClose();
    };

    const hasLocation = latitude !== null && longitude !== null;

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-zinc-100 p-4 dark:border-zinc-800">
                <button
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-all active:scale-95 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
                <h1 className="flex-1 text-2xl font-bold text-zinc-900 dark:text-white">
                    {editingStore ? 'Edit Store' : 'Add Store'}
                </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
                <div className="mx-auto max-w-md space-y-6">
                    {/* Store Name */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
                            Store Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Walmart, Target, Costco"
                            className="w-full rounded-lg border-0 bg-zinc-100 px-4 py-3 text-base outline-none ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-orange-500 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-orange-500"
                            required
                        />
                    </div>

                    {/* Location Capture */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
                            Location
                        </label>
                        <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={geolocation.loading}
                            className="w-full rounded-lg bg-orange-100 px-4 py-4 text-base font-semibold text-orange-600 transition-all active:scale-95 disabled:opacity-50 dark:bg-orange-900/30 dark:text-orange-400"
                        >
                            {geolocation.loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 size={20} className="animate-spin" />
                                    Getting location...
                                </div>
                            ) : hasLocation ? (
                                <div className="flex items-center justify-center gap-2">
                                    <MapPin size={20} />
                                    Location captured ✓
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <MapPin size={20} />
                                    Capture current location
                                </div>
                            )}
                        </button>
                        {geolocation.error && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                {geolocation.error}
                            </p>
                        )}
                        {hasLocation && (
                            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                                📍 {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                            </p>
                        )}
                    </div>

                    {/* Radius */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-zinc-900 dark:text-white">
                            Detection Radius: {radius}m
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="500"
                            step="10"
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-full accent-orange-500"
                        />
                        <div className="mt-1 flex justify-between text-xs text-zinc-500">
                            <span>50m</span>
                            <span>500m</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!hasLocation}
                        className="w-full rounded-full bg-orange-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition-all active:scale-95 active:bg-orange-600 disabled:opacity-50 disabled:shadow-none"
                    >
                        {editingStore ? 'Update Store' : 'Add Store'}
                    </button>
                </div>
            </form>
        </div>
    );
}
