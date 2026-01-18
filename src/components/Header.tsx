import { ShoppingBag, Menu } from 'lucide-react';
import { useStore } from '../store';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const stores = useStore((state) => state.stores);
    const currentStore = useStore((state) => state.currentStore);

    const currentStoreName = currentStore
        ? stores.find(s => s.id === currentStore)?.name
        : null;

    return (
        <header className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-all active:scale-95 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
                    <ShoppingBag size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        ToBuy
                    </h1>
                    {currentStoreName && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            📍 {currentStoreName}
                        </p>
                    )}
                </div>
            </div>
            <div className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Offline Ready
            </div>
        </header>
    );
}
