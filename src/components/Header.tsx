import { ShoppingBag, Menu, RefreshCw, Settings, Check, X } from 'lucide-react';
import { useStore } from '../store';
import { useState } from 'react';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { supabaseUrl, supabaseAnonKey, setSupabaseConfig, syncWithSupabase, isSyncing } = useStore();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [tempUrl, setTempUrl] = useState(supabaseUrl || '');
    const [tempKey, setTempKey] = useState(supabaseAnonKey || '');

    const handleSave = () => {
        setSupabaseConfig(tempUrl, tempKey);
        setIsSettingsOpen(false);
    };

    const isConfigured = supabaseUrl && supabaseAnonKey;

    return (
        <>
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
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
                            ToBuy <span className="text-[10px] font-medium text-orange-400 align-top opacity-50 uppercase tracking-widest">v2.1 Realtime</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isConfigured ? (
                        <>
                            <button
                                onClick={() => syncWithSupabase()}
                                disabled={isSyncing}
                                className={`p-2 rounded-xl transition-all ${isSyncing
                                    ? 'bg-zinc-100 text-zinc-400 animate-spin dark:bg-zinc-800'
                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400'
                                    }`}
                                title="Sync now"
                            >
                                <RefreshCw size={20} />
                            </button>
                            <button
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-all dark:hover:bg-zinc-800"
                                title="Sharing Settings"
                            >
                                <Settings size={20} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20 active:transform active:scale-95"
                        >
                            <Settings size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">Sync Setup</span>
                        </button>
                    )}
                </div>
            </header>

            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 overflow-y-auto max-h-[90vh]">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Supabase Sync</h2>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                                <X size={20} />
                            </button>
                        </div>
                        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                            Configure your Supabase project to share this list.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-1 font-bold">Project URL</label>
                                <input
                                    type="text"
                                    value={tempUrl}
                                    onChange={(e) => setTempUrl(e.target.value)}
                                    placeholder="https://xyz.supabase.co"
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-500 uppercase mb-1 font-bold">Anon Key</label>
                                <input
                                    type="password"
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    placeholder="eyJhbG..."
                                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-800 dark:bg-zinc-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="flex-1 rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:transform active:scale-95 transition-all"
                            >
                                <Check size={18} />
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
