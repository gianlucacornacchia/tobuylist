import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';
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
    supabaseUrl: string | null;
    supabaseAnonKey: string | null;
    isSyncing: boolean;
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
    setSupabaseConfig: (url: string | null, key: string | null) => void;
    syncWithSupabase: () => Promise<void>;
    fullSync: () => Promise<void>;
    pushLocalChanges: () => Promise<void>;
    pullRemoteChanges: () => Promise<void>;
    subscribeToSupabase: () => () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            items: [],
            itemRanks: {},
            itemHistory: [],
            itemBuyCounts: {},
            stores: [],
            currentStore: null,
            storeVisits: [],
            locationPermission: 'prompt',
            supabaseUrl: null,
            supabaseAnonKey: null,
            isSyncing: false,
            setItems: (items) => set({ items }),
            setSupabaseConfig: (url, key) => set({ supabaseUrl: url, supabaseAnonKey: key }),
            syncWithSupabase: async () => {
                // Legacy wrapper for backwards compatibility
                await get().fullSync();
            },
            fullSync: async () => {
                // Push then Pull
                await get().pushLocalChanges();
                await get().pullRemoteChanges();
            },
            pushLocalChanges: async () => {
                const { supabaseUrl, supabaseAnonKey, items } = get();
                if (!supabaseUrl || !supabaseAnonKey) return;

                const supabase = createClient(supabaseUrl, supabaseAnonKey);
                try {
                    set({ isSyncing: true });
                    const { error } = await supabase
                        .from('items')
                        .upsert(items.map(i => ({
                            id: i.id,
                            name: i.name,
                            is_bought: i.isBought,
                            category: i.category,
                            created_at: i.createdAt,
                            item_order: i.order
                        })));

                    if (error) throw error;
                } catch (error) {
                    console.error('Push failed:', error);
                } finally {
                    set({ isSyncing: false });
                }
            },
            pullRemoteChanges: async () => {
                const { supabaseUrl, supabaseAnonKey } = get();
                if (!supabaseUrl || !supabaseAnonKey) return;

                const supabase = createClient(supabaseUrl, supabaseAnonKey);
                try {
                    set({ isSyncing: true });
                    const { data: remoteItems, error } = await supabase
                        .from('items')
                        .select('*');

                    if (error) throw error;

                    const mappedRemote: Item[] = (remoteItems || []).map((r: {
                        id: string;
                        name: string;
                        is_bought: boolean;
                        category?: string;
                        created_at: number;
                        item_order: number;
                    }) => ({
                        id: r.id,
                        name: r.name,
                        isBought: r.is_bought,
                        category: r.category,
                        createdAt: r.created_at,
                        order: r.item_order
                    }));

                    set({ items: mappedRemote });
                } catch (error) {
                    console.error('Pull failed:', error);
                } finally {
                    set({ isSyncing: false });
                }
            },
            subscribeToSupabase: () => {
                const { supabaseUrl, supabaseAnonKey } = get();
                if (!supabaseUrl || !supabaseAnonKey) return () => { };

                const supabase = createClient(supabaseUrl, supabaseAnonKey);
                const channel = supabase
                    .channel('schema-db-changes')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'items',
                        },
                        (payload) => {
                            const { items } = get();

                            if (payload.eventType === 'INSERT') {
                                const newItem: Item = {
                                    id: payload.new.id,
                                    name: payload.new.name,
                                    isBought: payload.new.is_bought,
                                    category: payload.new.category,
                                    createdAt: payload.new.created_at,
                                    order: payload.new.item_order,
                                };
                                // Only add if not already present (local add might have already put it there)
                                if (!items.find(i => i.id === newItem.id)) {
                                    set({ items: [...items, newItem] });
                                }
                            } else if (payload.eventType === 'UPDATE') {
                                const updatedItem: Item = {
                                    id: payload.new.id,
                                    name: payload.new.name,
                                    isBought: payload.new.is_bought,
                                    category: payload.new.category,
                                    createdAt: payload.new.created_at,
                                    order: payload.new.item_order,
                                };
                                set({
                                    items: items.map(i => i.id === updatedItem.id ? updatedItem : i)
                                });
                            } else if (payload.eventType === 'DELETE') {
                                const deletedId = payload.old.id;
                                set({
                                    items: items.filter(i => i.id !== deletedId)
                                });
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            },
            addItem: (name, category) => {
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
                });
                get().pushLocalChanges();
            },
            toggleItem: (id) => {
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
                });
                get().pushLocalChanges();
            },
            deleteItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
                const { supabaseUrl, supabaseAnonKey } = get();
                // Special case for delete: we need to explicitly delete from remote
                if (supabaseUrl && supabaseAnonKey) {
                    const supabase = createClient(supabaseUrl, supabaseAnonKey);
                    supabase.from('items').delete().eq('id', id).then();
                }
            },
            clearBought: () => {
                const boughtIds = get().items.filter(i => i.isBought).map(i => i.id);
                set((state) => ({
                    items: state.items.filter((item) => !item.isBought),
                }));
                const { supabaseUrl, supabaseAnonKey } = get();
                if (supabaseUrl && supabaseAnonKey && boughtIds.length > 0) {
                    const supabase = createClient(supabaseUrl, supabaseAnonKey);
                    supabase.from('items').delete().in('id', boughtIds).then();
                }
            },
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

// End of store
