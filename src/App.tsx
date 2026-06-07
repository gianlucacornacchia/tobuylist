import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Header } from './components/Header';
import { ItemList } from './components/ItemList';
import { AddItem } from './components/AddItem';
import { Menu } from './components/Menu';
import { StoreManager } from './components/StoreManager';
import { useGeolocation, findClosestStore } from './hooks/useGeolocation';
import { useStore } from './store';

function App() {
    const [height, setHeight] = useState('100dvh');
    const [vpOffset, setVpOffset] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);
    const [currentPage, setCurrentPage] = useState<'list' | 'stores'>('list');
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    const stores = useStore((state) => state.stores);
    const currentStore = useStore((state) => state.currentStore);
    const setCurrentStore = useStore((state) => state.setCurrentStore);
    const geolocation = useGeolocation();

    useEffect(() => {
        if (geolocation.latitude && geolocation.longitude && stores.length > 0) {
            const closestStoreId = findClosestStore(
                geolocation.latitude,
                geolocation.longitude,
                stores
            );

            if (closestStoreId !== currentStore) {
                setCurrentStore(closestStoreId);
            }
        }
    }, [geolocation.latitude, geolocation.longitude, stores, currentStore, setCurrentStore]);

    // Supabase Realtime Subscription
    const supabaseUrl = useStore((state) => state.supabaseUrl);
    const supabaseAnonKey = useStore((state) => state.supabaseAnonKey);
    const subscribeToSupabase = useStore((state) => state.subscribeToSupabase);
    const syncWithSupabase = useStore((state) => state.syncWithSupabase);
    const setSupabaseConfig = useStore((state) => state.setSupabaseConfig);

    useEffect(() => {
        // Handle Magic Link / QR Code config sharing
        // Try hash fragment first (new format, survives iOS Add-to-Home-Screen)
        let su: string | null = null;
        let sk: string | null = null;
        let fromHash = false;

        if (window.location.hash && window.location.hash.length > 1) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            su = hashParams.get('su');
            sk = hashParams.get('sk');
            if (su && sk) fromHash = true;
        }

        // Fallback to query params (backward compat with old QR codes)
        if (!su || !sk) {
            const searchParams = new URLSearchParams(window.location.search);
            su = searchParams.get('su');
            sk = searchParams.get('sk');
        }

        if (su && sk) {
            try {
                const url = atob(su.replace(/ /g, '+'));
                const key = atob(sk.replace(/ /g, '+'));
                setSupabaseConfig(url, key);

                if (fromHash) {
                    // Keep hash in URL — iOS Safari needs it for Add-to-Home-Screen.
                    // Show install banner on iOS Safari when not already in standalone mode.
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                    const isStandalone = ('standalone' in navigator) && (navigator as unknown as { standalone: boolean }).standalone;
                    if (isIOS && !isStandalone) {
                        setShowInstallBanner(true);
                    }
                } else {
                    // Clear query params (old format), preserve any hash
                    window.history.replaceState({}, '', window.location.pathname + window.location.hash);
                }
            } catch (e) {
                console.error("Invalid Supabase configuration URL.");
            }
        }
    }, [setSupabaseConfig]);

    useEffect(() => {
        if (!supabaseUrl || !supabaseAnonKey) return;

        // Perform initial sync
        syncWithSupabase();

        // Setup real-time listener
        const unsubscribe = subscribeToSupabase();
        return () => {
            unsubscribe();
        };
    }, [supabaseUrl, supabaseAnonKey, subscribeToSupabase, syncWithSupabase]);

    useEffect(() => {
        // Visual Viewport API for reliable mobile keyboard handling.
        // On iOS, when the keyboard opens the visual viewport shrinks and
        // scrolls independently of the layout viewport. position:fixed
        // elements are anchored to the layout viewport, so without
        // compensating for visualViewport.offsetTop the app gets pushed
        // out of the visible area.
        let rafId: number | undefined;

        const handleViewport = () => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (window.visualViewport) {
                    setHeight(`${window.visualViewport.height}px`);
                    setVpOffset(window.visualViewport.offsetTop);
                }
            });
        };

        const handleWindowScroll = () => {
            // Safety net: prevent any window-level scrolling.
            // But skip when an input/textarea is focused — iOS Safari
            // intentionally scrolls the layout viewport to bring the
            // focused element above the virtual keyboard.  Fighting
            // that scroll causes the fixed container to be mis-positioned,
            // pushing the input out of the visible area.
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (window.scrollY > 0 || window.scrollX > 0) {
                window.scrollTo(0, 0);
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleViewport);
            window.visualViewport.addEventListener('scroll', handleViewport);
            window.addEventListener('scroll', handleWindowScroll);
            handleViewport(); // Init
        }

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleViewport);
                window.visualViewport.removeEventListener('scroll', handleViewport);
            }
            window.removeEventListener('scroll', handleWindowScroll);
        };
    }, []);

    const handleNavigate = (page: 'stores') => {
        setCurrentPage(page);
    };

    return (
        <div
            style={{ height, top: `${vpOffset}px`, position: 'fixed', left: 0, right: 0 }}
            className="flex flex-col overflow-hidden bg-zinc-50 dark:bg-black"
        >
            <div className="mx-auto flex w-full max-w-lg flex-1 flex-col min-h-0 bg-white shadow-2xl shadow-zinc-200 dark:bg-zinc-900 dark:shadow-zinc-900/50">
                {showInstallBanner && (
                    <div className="flex items-center gap-3 bg-orange-50 px-4 py-3 text-sm dark:bg-orange-900/20">
                        <div className="flex-1 text-orange-800 dark:text-orange-200">
                            <strong>Tip:</strong> Tap the Share button
                            {' '}then <strong>"Add to Home Screen"</strong> for the best experience.
                        </div>
                        <button
                            onClick={() => setShowInstallBanner(false)}
                            className="shrink-0 rounded-lg p-1 text-orange-600 hover:bg-orange-100 dark:text-orange-400 dark:hover:bg-orange-800/30"
                            aria-label="Dismiss"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
                <Header 
                    onMenuClick={() => setIsMenuOpen(true)} 
                    isSettingsOpen={isSettingsOpen}
                    setIsSettingsOpen={setIsSettingsOpen}
                />
                <Menu
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    onNavigate={handleNavigate}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                />
                {currentPage === 'list' ? (
                    <>
                        <main className="flex-1 min-h-0" style={{ touchAction: 'pan-y' }}>
                            <ItemList onEditingQuantityChange={setIsEditingQuantity} />
                        </main>
                        {(!isMenuOpen && !isSettingsOpen && !isEditingQuantity) && <AddItem />}
                    </>
                ) : (
                    <StoreManager onBack={() => setCurrentPage('list')} />
                )}
            </div>
        </div>
    );
}

export default App;
