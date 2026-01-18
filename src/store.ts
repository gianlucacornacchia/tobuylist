import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Item, Store, StoreVisit } from './types';

interface AppState {
    items: Item[];
    itemRanks: Record<string, number>;
    itemHistory: string[];
    itemBuyCounts: Record<string, number>;
    stores: Store[];
    currentStore: string | null;
    storeVisits: StoreVisit[];
    locationPermission: 'granted' | 'denied' | 'prompt';
    addItem: (name: string, category?: string) => void;
    toggleItem: (id: string) => void;
    deleteItem: (id: string) => void;
    clearBought: () => void;
    setItems: (items: Item[]) => void;
    addStore: (store: Omit<Store, 'id' | 'createdAt'>) => void;
    updateStore: (id: string, updates: Partial<Store>) => void;
    deleteStore: (id: string) => void;
    setCurrentStore: (id: string | null) => void;
    addStoreVisit: (visit: StoreVisit) => void;
    setLocationPermission: (permission: 'granted' | 'denied' | 'prompt') => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            items: [],
            itemRanks: {},
            itemHistory: [],
            itemBuyCounts: {},
            stores: [],
            currentStore: null,
            storeVisits: [],
            locationPermission: 'prompt',
            setItems: (items) => set({ items }),
            addItem: (name, category) =>
                set((state) => {
                    const normalizedName = name.trim();
                    const lowerName = normalizedName.toLowerCase();

                    // Check for existing item with same name (case-insensitive)
                    const existingItemIndex = state.items.findIndex(
                        (i) => i.name.toLowerCase() === lowerName
                    );

                    const newHistory = state.itemHistory.includes(normalizedName)
                        ? state.itemHistory
                        : [...state.itemHistory, normalizedName];

                    // Determine sort order
                    const rank = state.itemRanks[lowerName] ?? Date.now();

                    if (existingItemIndex !== -1) {
                        const existingItem = state.items[existingItemIndex];

                        // If it's already in the pending list, do nothing.
                        if (!existingItem.isBought) {
                            return state;
                        }

                        // Item exists. If it's bought, bring it back.
                        // We will treat it "as if searched and added", so update its order.
                        const updatedItems = [...state.items];
                        updatedItems[existingItemIndex] = {
                            ...existingItem,
                            isBought: false, // Revive if bought
                            order: rank,     // Apply smart sort order
                            category: category ?? existingItem.category // Update category if provided
                        };

                        return {
                            items: updatedItems,
                            itemHistory: newHistory,
                        };
                    }

                    return {
                        items: [
                            {
                                id: crypto.randomUUID(),
                                name: normalizedName,
                                isBought: false,
                                category,
                                createdAt: Date.now(),
                                order: rank,
                            },
                            ...state.items,
                        ],
                        itemHistory: newHistory,
                    };
                }),
            toggleItem: (id) =>
                set((state) => {
                    const item = state.items.find((i) => i.id === id);
                    if (!item) return state;

                    const isNowBought = !item.isBought;
                    const newRanks = { ...state.itemRanks };
                    const newBuyCounts = { ...state.itemBuyCounts };

                    const itemNameKey = item.name.toLowerCase();

                    // If marking as bought, update its rank and increment count
                    if (isNowBought) {
                        newRanks[itemNameKey] = Date.now();
                        newBuyCounts[itemNameKey] = (newBuyCounts[itemNameKey] || 0) + 1;
                    } else {
                        newBuyCounts[itemNameKey] = Math.max(0, (newBuyCounts[itemNameKey] || 0) - 1);
                    }

                    return {
                        items: state.items.map((i) => {
                            if (i.id !== id) return i;

                            // "as if it was searched and added from user"
                            // When un-buying (bringing back), strict smart sort order.
                            const rank = newRanks[i.name.toLowerCase()] ?? Date.now();
                            const newOrder = !isNowBought ? rank : i.order;

                            return { ...i, isBought: isNowBought, order: newOrder };
                        }),
                        itemRanks: newRanks,
                        itemBuyCounts: newBuyCounts,
                    };
                }),
            deleteItem: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),
            clearBought: () =>
                set((state) => ({
                    items: state.items.filter((item) => !item.isBought),
                })),
            addStore: (store) =>
                set((state) => ({
                    stores: [
                        ...state.stores,
                        {
                            ...store,
                            id: crypto.randomUUID(),
                            createdAt: Date.now(),
                        },
                    ],
                })),
            updateStore: (id, updates) =>
                set((state) => ({
                    stores: state.stores.map((store) =>
                        store.id === id ? { ...store, ...updates } : store
                    ),
                })),
            deleteStore: (id) =>
                set((state) => ({
                    stores: state.stores.filter((store) => store.id !== id),
                    currentStore: state.currentStore === id ? null : state.currentStore,
                })),
            setCurrentStore: (id) => set({ currentStore: id }),
            addStoreVisit: (visit) =>
                set((state) => ({
                    storeVisits: [...state.storeVisits, visit],
                    stores: state.stores.map((store) =>
                        store.id === visit.storeId
                            ? {
                                ...store,
                                visitCount: store.visitCount + 1,
                                lastVisit: visit.timestamp,
                            }
                            : store
                    ),
                })),
            setLocationPermission: (permission) => set({ locationPermission: permission }),
        }),
        {
            name: 'tobuy-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.items = state.items.map(i => ({
                        ...i,
                        order: i.order ?? i.createdAt
                    }));
                }
            }
        }
    )
);
