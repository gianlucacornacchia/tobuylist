import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '../store';

export function AddItem() {
    const [name, setName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const addItem = useStore((state) => state.addItem);
    const itemHistory = useStore((state) => state.itemHistory);
    const itemBuyCounts = useStore((state) => state.itemBuyCounts);

    const items = useStore((state) => state.items);
    const activeItemNames = new Set(
        items.filter(i => !i.isBought).map(i => i.name.toLowerCase())
    );

    const suggestions = name.trim()
        ? itemHistory.filter(item => {
            const historyItem = item.toLowerCase();
            const search = name.toLowerCase();

            // Filter out items that are already in the active list
            if (activeItemNames.has(historyItem)) return false;

            // If search is short, only match prefix to avoid noisy results
            if (search.length < 3) {
                return historyItem.startsWith(search) && historyItem !== search;
            }
            return historyItem.includes(search) && historyItem !== search;
        }).sort((a, b) => {
            // Sort by frequency (highest count first)
            const countA = itemBuyCounts[a.toLowerCase()] ?? 0;
            const countB = itemBuyCounts[b.toLowerCase()] ?? 0;
            if (countA !== countB) return countB - countA;
            // Fallback to alphabetical
            return a.localeCompare(b);
        }).slice(0, 3) // Limit to 3 suggestions
        : [];

    const parseInput = (input: string) => {
        let name = input.trim();
        let quantity: number | undefined;
        let unit: string | undefined;

        // Check format: "2 Kg Apples" or "2Kg Apples" or "2 Apples"
        const startMatch = name.match(/^([\d.]+)\s*(Kg|g|L)?\s+(.+)$/i);
        if (startMatch) {
            quantity = parseFloat(startMatch[1]);
            unit = startMatch[2];
            name = startMatch[3];
        } else {
            // Check format: "Apples 2 Kg" or "Apples 2Kg"
            const endMatch = name.match(/^(.+?)\s+([\d.]+)\s*(Kg|g|L)?$/i);
            if (endMatch) {
                name = endMatch[1];
                quantity = parseFloat(endMatch[2]);
                unit = endMatch[3];
            }
        }

        if (unit) {
            const lower = unit.toLowerCase();
            unit = lower === 'l' ? 'L' : (lower === 'kg' ? 'Kg' : 'g');
        }

        return { name, quantity: isNaN(quantity as any) ? undefined : quantity, unit };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            const parsed = parseInput(name);
            addItem(parsed.name, undefined, parsed.quantity, parsed.unit);
            setName('');
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setName(suggestion + ' ');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    return (
        <form onSubmit={handleSubmit} className="relative z-50 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] dark:bg-zinc-900">
            {/* Suggestions Popup */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 px-4">
                    <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                                    <Plus size={16} className="text-zinc-500" />
                                </div>
                                <span className="text-base text-zinc-700 dark:text-zinc-300">{suggestion}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mx-auto flex max-w-md gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Add item..."
                    className="flex-1 rounded-full border-0 bg-zinc-100 px-6 py-4 text-base outline-none ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-500 focus:ring-2 focus:ring-inset focus:ring-orange-500 dark:bg-zinc-800 dark:text-white dark:ring-zinc-700 dark:focus:ring-orange-500"
                />
                <button
                    type="submit"
                    disabled={!name.trim()}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-all active:scale-95 active:bg-orange-600 disabled:opacity-50 disabled:shadow-none"
                >
                    <Plus size={24} strokeWidth={2.5} />
                </button>
            </div>
        </form>
    );
}
