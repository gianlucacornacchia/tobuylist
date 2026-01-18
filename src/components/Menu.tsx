import { X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: 'stores') => void;
}

export function Menu({ isOpen, onClose, onNavigate }: MenuProps) {
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
                        <nav className="p-2">
                            <button
                                onClick={() => {
                                    onNavigate('stores');
                                    onClose();
                                }}
                                className="flex w-full items-center gap-3 rounded-lg p-4 text-left transition-all active:scale-95 active:bg-zinc-100 dark:active:bg-zinc-800"
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
                        </nav>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
