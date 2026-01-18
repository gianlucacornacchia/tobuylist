import { ShoppingBag } from 'lucide-react';

export function Header() {
    return (
        <header className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/20">
                    <ShoppingBag size={24} strokeWidth={2.5} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    ToBuy
                </h1>
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Offline Ready
            </div>
        </header>
    );
}
