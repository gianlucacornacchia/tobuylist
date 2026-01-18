import { MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Store } from '../types';

interface StoreDisambiguationProps {
    isOpen: boolean;
    stores: Array<{ store: Store; distance: number }>;
    onSelect: (storeId: string) => void;
    onDismiss: () => void;
}

export function StoreDisambiguation({ isOpen, stores, onSelect, onDismiss }: StoreDisambiguationProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl dark:bg-zinc-900"
                    >
                        {/* Header */}
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Multiple stores nearby
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Which store are you at?
                            </p>
                        </div>

                        {/* Store List */}
                        <div className="space-y-2">
                            {stores.map(({ store, distance }) => (
                                <button
                                    key={store.id}
                                    onClick={() => onSelect(store.id)}
                                    className="w-full rounded-lg bg-zinc-100 p-4 text-left transition-all active:scale-95 active:bg-orange-100 dark:bg-zinc-800 dark:active:bg-orange-900/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                                <MapPin size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-zinc-900 dark:text-white">
                                                    {store.name}
                                                </div>
                                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    {distance < 1000
                                                        ? `${Math.round(distance)}m away`
                                                        : `${(distance / 1000).toFixed(1)}km away`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Dismiss Button */}
                        <button
                            onClick={onDismiss}
                            className="mt-4 w-full rounded-lg bg-zinc-200 px-4 py-3 text-base font-semibold text-zinc-700 transition-all active:scale-95 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                            Ask me later
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
