import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ItemList } from './components/ItemList';
import { AddItem } from './components/AddItem';
import { Menu } from './components/Menu';
import { StoreManager } from './components/StoreManager';
import { useGeolocation, findClosestStore } from './hooks/useGeolocation';
import { useStore } from './store';

function App() {
    const [height, setHeight] = useState('100dvh');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState<'list' | 'stores'>('list');

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
        // Visual Viewport API for reliable mobile keyboard handling
        const handleResize = () => {
            if (window.visualViewport) {
                setHeight(`${window.visualViewport.height}px`);
                // Scroll to top to ensure we aren't scrolled out of view
                window.scrollTo(0, 0);
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            handleResize(); // Init
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    const handleNavigate = (page: 'stores') => {
        setCurrentPage(page);
    };

    return (
        <div
            style={{ height }}
            className="flex flex-col overflow-hidden bg-zinc-50 dark:bg-black"
        >
            <div className="mx-auto flex w-full max-w-lg flex-1 flex-col bg-white shadow-2xl shadow-zinc-200 dark:bg-zinc-900 dark:shadow-zinc-900/50">
                <Header onMenuClick={() => setIsMenuOpen(true)} />
                <Menu
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    onNavigate={handleNavigate}
                />
                {currentPage === 'list' ? (
                    <>
                        <main className="flex-1 overflow-y-auto overscroll-contain">
                            <ItemList />
                        </main>
                        <AddItem />
                    </>
                ) : (
                    <StoreManager onBack={() => setCurrentPage('list')} />
                )}
            </div>
        </div>
    );
}

export default App;
