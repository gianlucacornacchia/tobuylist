import { X, MapPin, RefreshCw, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListManager } from './ListManager';
import { useStore } from '../store';
import pkg from '../../package.json';

interface MenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: 'stores') => void;
    onOpenSettings: () => void;
}

export function Menu({ isOpen, onClose, onNavigate, onOpenSettings }: MenuProps) {
    const { syncWithSupabase, isSyncing, supabaseUrl, supabaseAnonKey } = useStore();
    const isConfigured = supabaseUrl && supabaseAnonKey;
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
                        className="fixed inset-0 z-40 bg-black/50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl dark:bg-zinc-900"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-100 p-4 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Menu</h2>
                            <button
                                onClick={onClose}
                                className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-all active:scale-95 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
                                aria-label="Close menu"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                            <ListManager />

                            <div className="my-4 h-px bg-zinc-100 dark:bg-zinc-800" />

                            <button
                                onClick={() => {
                                    onNavigate('stores');
                                    onClose();
                                }}
                                className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all active:scale-95 active:bg-zinc-100 dark:active:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-zinc-900 dark:text-white">
                                        Store Manager
                                    </div>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Manage your stores
                                    </div>
                                </div>
                            </button>

                            <div className="my-4 h-px bg-zinc-100 dark:bg-zinc-800" />

                            {isConfigured ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => syncWithSupabase()}
                                        disabled={isSyncing}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg p-3 transition-all active:scale-95 ${isSyncing
                                            ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                                            : 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400'
                                            }`}
                                    >
                                        <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                                        <span className="text-sm font-semibold">Sync Now</span>
                                    </button>
                                    <button
                                        onClick={() => { onOpenSettings(); onClose(); }}
                                        className="flex-1 flex items-center justify-center gap-2 rounded-lg p-3 text-zinc-600 hover:bg-zinc-50 transition-all active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                                    >
                                        <Settings size={18} />
                                        <span className="text-sm font-semibold">Settings</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { onOpenSettings(); onClose(); }}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 p-3 text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
                                >
                                    <Settings size={18} />
                                    <span className="text-sm font-bold uppercase tracking-wider">Sync Setup</span>
                                </button>
                            )}

                            <div className="mt-auto pt-4">
                                <p className="text-center text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
                                    v{pkg.version}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
