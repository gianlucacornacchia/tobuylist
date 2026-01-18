import { X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { useGeolocation, calculateDistance } from '../hooks/useGeolocation';

interface StoreSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StoreSelector({ isOpen, onClose }: StoreSelectorProps) {
    const stores = useStore((state) => state.stores);
    const currentStore = useStore((state) => state.currentStore);
    const setCurrentStore = useStore((state) => state.setCurrentStore);
    const geolocation = useGeolocation();

    const handleSelectStore = (storeId: string | null) => {
        setCurrentStore(storeId);
        onClose();
    };

    // Calculate distances if location available
    const storesWithDistance = stores.map(store => ({
        ...store,
        distance: geolocation.latitude && geolocation.longitude
            ? calculateDistance(geolocation.latitude, geolocation.longitude, store.latitude, store.longitude)
            : null
    })).sort((a, b) => {
        // Sort by distance if available, otherwise alphabetically
        if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
        }
        return a.name.localeCompare(b.name);
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900"
                    >
                        {/* Header */}
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Select Store
                            </h2>
                            <button
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition-all active:scale-95 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Store List */}
                        <div className="max-h-96 space-y-2 overflow-y-auto">
                            {/* None option */}
                            <button
                                onClick={() => handleSelectStore(null)}
                                className={`w-full rounded-lg p-3 text-left transition-all active:scale-95 ${currentStore === null
                                        ? 'bg-orange-100 dark:bg-orange-900/30'
                                        : 'bg-zinc-100 dark:bg-zinc-800'
                                    }`}
                            >
                                <div className="font-semibold text-zinc-900 dark:text-white">
                                    No store selected
                                </div>
                            </button>

                            {storesWithDistance.map((store) => (
                                <button
                                    key={store.id}
                                    onClick={() => handleSelectStore(store.id)}
                                    className={`w-full rounded-lg p-3 text-left transition-all active:scale-95 ${currentStore === store.id
                                            ? 'bg-orange-100 dark:bg-orange-900/30'
                                            : 'bg-zinc-100 dark:bg-zinc-800'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-orange-500" />
                                            <span className="font-semibold text-zinc-900 dark:text-white">
                                                {store.name}
                                            </span>
                                        </div>
                                        {store.distance !== null && (
                                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                {store.distance < 1000
                                                    ? `${Math.round(store.distance)}m`
                                                    : `${(store.distance / 1000).toFixed(1)}km`}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}

                            {stores.length === 0 && (
                                <div className="py-8 text-center text-zinc-500">
                                    No stores added yet
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
