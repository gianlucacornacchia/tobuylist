import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@supabase/supabase-js';
import type { Item, Store, StoreVisit, List } from './types';

interface AppState {
    lists: List[];
    currentListId: string | null;
    createList: (name: string) => Promise<{ id: string; success: boolean; message?: string }>;
    switchList: (id: string) => void;
    deleteList: (id: string) => Promise<void>;
    renameList: (id: string, name: string) => Promise<void>;
    joinList: (shareCode: string) => Promise<{ success: boolean; message?: string }>;
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
            lists: [],
            currentListId: null,
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
            createList: async (name) => {
                const newList: List = {
                    id: crypto.randomUUID(),
                    name,
                    shareCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    createdAt: Date.now()
                };

                set(state => ({
                    lists: [...state.lists, newList],
                    currentListId: newList.id
                }));

                let success = true;
                let message: string | undefined;

                // Push to Supabase if connected
                const { supabaseUrl, supabaseAnonKey } = get();

                if (supabaseUrl && supabaseAnonKey) {
                    const supabase = createClient(supabaseUrl, supabaseAnonKey);
                    const { error } = await supabase.from('lists').upsert({
                        id: newList.id,
                        name: newList.name,
                        created_at: new Date(newList.createdAt).toISOString(),
                        share_code: newList.shareCode
                    });

                    if (error) {
                        console.error("FAILED TO SYNC LIST:", error);
                        success = false;
                        message = "Created locally, but failed to sync: " + error.message;
                    }
                } else {
                    console.warn("SKIPPED SYNC - NO CREDENTIALS CONFIGURED");
                    success = false;
                    message = "Created locally only. Configure Sync Settings to share.";
                }
                return { id: newList.id, success, message };
            },
            switchList: (id) => {
                set({ currentListId: id });
                get().pullRemoteChanges();
            },
            deleteList: async (id) => {
                const { supabaseUrl, supabaseAnonKey } = get();

                set(state => {
                    const newLists = state.lists.filter(l => l.id !== id);
                    // Switch to first available list or null
                    const newCurrentId = state.currentListId === id
                        ? (newLists[0]?.id ?? null)
                        : state.currentListId;

                    return {
                        lists: newLists,
                        currentListId: newCurrentId,
                        // Remove items associated with this list
                        items: state.items.filter(i => i.listId !== id)
                    };
                });

                if (supabaseUrl && supabaseAnonKey) {
                    const supabase = createClient(supabaseUrl, supabaseAnonKey);
                    await supabase.from('lists').delete().eq('id', id);
                }
            },
            renameList: async (id, name) => {
                set(state => ({
                    lists: state.lists.map(l => l.id === id ? { ...l, name } : l)
                }));

                const { supabaseUrl, supabaseAnonKey } = get();
                if (supabaseUrl && supabaseAnonKey) {
                    const supabase = createClient(supabaseUrl, supabaseAnonKey);
                    await supabase.from('lists').update({ name }).eq('id', id);
                }
            },
            joinList: async (shareCode) => {
                const { supabaseUrl, supabaseAnonKey } = get();
                if (!supabaseUrl || !supabaseAnonKey) {
                    return { success: false, message: 'Missing Supabase configuration. Please set it up in Settings.' };
                }

                const supabase = createClient(supabaseUrl, supabaseAnonKey);
                const { data, error } = await supabase
                    .from('lists')
                    .select('*')
                    .eq('share_code', shareCode)
                    .limit(1)
                    .maybeSingle();

                if (error) {
                    return { success: false, message: error.message || 'Error fetching list.' };
                }

                if (!data) {
                    return { success: false, message: 'List not found. Please check the code.' };
                }

                const newList: List = {
                    id: data.id,
                    name: data.name,
                    shareCode: data.share_code,
                    createdAt: new Date(data.created_at).getTime()
                };

                // Check if we already have this list
                const { lists } = get();
                if (!lists.find(l => l.id === newList.id)) {
                    set(state => ({
                        lists: [...state.lists, newList],
                        currentListId: newList.id
                    }));
                } else {
                    set({ currentListId: newList.id });
                }

                // Fire and forget fetch to speed up UI
                get().pullRemoteChanges();
                return { success: true };
            },
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
                            list_id: i.listId,
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
                const { supabaseUrl, supabaseAnonKey, currentListId } = get();
                if (!supabaseUrl || !supabaseAnonKey || !currentListId) return;

                const supabase = createClient(supabaseUrl, supabaseAnonKey);
                try {
                    set({ isSyncing: true });
                    const { data: remoteItems, error } = await supabase
                        .from('items')
                        .select('*')
                        .eq('list_id', currentListId);

                    if (error) throw error;

                    const mappedRemote: Item[] = (remoteItems || []).map((r: {
                        id: string;
                        list_id: string;
                        name: string;
                        is_bought: boolean;
                        category?: string;
                        created_at: number;
                        item_order: number;
                    }) => ({
                        id: r.id,
                        listId: r.list_id,
                        name: r.name,
                        isBought: r.is_bought,
                        category: r.category,
                        createdAt: r.created_at,
                        order: r.item_order
                    }));

                    // We are replacing items for the *current list* only.
                    // But wait, the state.items should probably only contain items for the current list? 
                    // OR we filter them in the UI? 
                    // Let's keep state.items as "all known items" or "items for current list"?
                    // Given the local-first nature, it's safer to keep "items for current list" loaded in memory if we want simplicity, 
                    // BUT for offline multi-list support we might want to store all.
                    // Let's decide: store ALL items in `items`, filter by `currentListId` in the UI.

                    set(state => {
                        // Remove old items for this list and add new ones
                        const otherListItems = state.items.filter(i => i.listId !== currentListId);
                        return { items: [...otherListItems, ...mappedRemote] };
                    });

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
                            const { items, currentListId } = get();

                            // Filter events not for the current list?
                            // Actually, maybe we should receive all events but only update state if relevant?
                            // OR we trust the client to filter? 
                            // The payload comes from "public"."items". It has all items.
                            // We should check if payload.new['list_id'] === currentListId OR payload.old['list_id'] === currentListId



                            if (payload.eventType === 'INSERT') {
                                if (payload.new.list_id !== currentListId) return;

                                const newItem: Item = {
                                    id: payload.new.id,
                                    listId: payload.new.list_id,
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
                                if (payload.new.list_id !== currentListId) return;

                                const updatedItem: Item = {
                                    id: payload.new.id,
                                    listId: payload.new.list_id,
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
                                // For DELETE, we might only have `old`.
                                // Ideally we check if the deleted item was in our view.
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
                    // Ensure list exists logic inside setter or check before? 
                    // Better verify list existence before calling set.
                    // BUT for now, let's assume valid state or fallback.
                    // Actually, let's make sure we have a list ID. 
                    // If `state.currentListId` is null, we should probably initialize a default list.

                    let activeListId = state.currentListId;
                    let newLists = state.lists;

                    if (!activeListId) {
                        const newList: List = {
                            id: crypto.randomUUID(),
                            name: "My List",
                            shareCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
                            createdAt: Date.now()
                        };
                        activeListId = newList.id;
                        newLists = [...state.lists, newList];
                        // Side effect: we should ideally persist this new list to Supabase too.
                        // We'll rely on a separate mechanism or just push it.
                        // For now, update local state.
                    }

                    const normalizedName = name.trim();
                    const lowerName = normalizedName.toLowerCase();

                    // Check for existing item with same name (case-insensitive) in the CURRENT LIST
                    const existingItemIndex = state.items.findIndex(
                        (i) => i.name.toLowerCase() === lowerName && i.listId === activeListId
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
                            return {
                                itemHistory: newHistory,
                                lists: newLists,
                                currentListId: activeListId
                            };
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
                            lists: newLists,
                            currentListId: activeListId
                        };
                    }

                    return {
                        items: [
                            {
                                id: crypto.randomUUID(),
                                listId: activeListId!, // We ensured it's not null
                                name: normalizedName,
                                isBought: false,
                                category,
                                createdAt: Date.now(),
                                order: rank,
                            },
                            ...state.items,
                        ],
                        itemHistory: newHistory,
                        lists: newLists,
                        currentListId: activeListId
                    };
                });

                // If we created a default list during this op, we really should sync it. 
                // Checks get() to see if we have lists to push? 
                // Simpler: let's enforce list creation being explicit in UI or init. 
                // But for migration, this lazy creation is robust.

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
