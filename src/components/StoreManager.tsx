import { useState } from 'react';
import { ArrowLeft, Plus, MapPin, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '../store';
import { StoreForm } from './StoreForm';
import type { Store } from '../types';

interface StoreManagerProps {
    onBack: () => void;
}

export function StoreManager({ onBack }: StoreManagerProps) {
    const stores = useStore((state) => state.stores);
    const deleteStore = useStore((state) => state.deleteStore);
    const [showForm, setShowForm] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);

    const handleEdit = (store: Store) => {
        setEditingStore(store);
        setShowForm(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this store?')) {
            deleteStore(id);
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingStore(null);
    };

    if (showForm) {
        return <StoreForm onClose={handleFormClose} editingStore={editingStore} />;
    }

    return (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-zinc-100 p-4 dark:border-zinc-800">
                <button
                    onClick={onBack}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-all active:scale-95 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
                    aria-label="Back to list"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="flex-1 text-2xl font-bold text-zinc-900 dark:text-white">
                    Store Manager
                </h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/30 transition-all active:scale-95 active:bg-orange-600"
                    aria-label="Add store"
                >
                    <Plus size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Store List */}
            <div className="flex-1 overflow-y-auto p-4">
                {stores.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 text-6xl">📍</div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            No stores yet
                        </h3>
                        <p className="text-zinc-500">
                            Add a store to start tracking your visits
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {stores.map((store) => (
                            <div
                                key={store.id}
                                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <MapPin size={16} className="text-orange-500" />
                                            <h3 className="font-semibold text-zinc-900 dark:text-white">
                                                {store.name}
                                            </h3>
                                        </div>
                                        <div className="mt-2 space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                                            <p>
                                                📊 {store.visitCount} visit{store.visitCount !== 1 ? 's' : ''}
                                            </p>
                                            {store.lastVisit > 0 && (
                                                <p>
                                                    🕒 Last visit: {new Date(store.lastVisit).toLocaleDateString()}
                                                </p>
                                            )}
                                            <p className="text-xs">
                                                Radius: {store.radius}m
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(store)}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition-all active:scale-95 active:bg-zinc-100 dark:text-zinc-400 dark:active:bg-zinc-800"
                                            aria-label="Edit store"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(store.id)}
                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition-all active:scale-95 active:bg-red-50 dark:text-red-400 dark:active:bg-red-900/20"
                                            aria-label="Delete store"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
