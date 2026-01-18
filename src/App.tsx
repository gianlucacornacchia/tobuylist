import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ItemList } from './components/ItemList';
import { AddItem } from './components/AddItem';

function App() {
    const [height, setHeight] = useState('100dvh');

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

    return (
        <div
            style={{ height }}
            className="flex flex-col overflow-hidden bg-zinc-50 dark:bg-black"
        >
            <div className="mx-auto flex w-full max-w-lg flex-1 flex-col bg-white shadow-2xl shadow-zinc-200 dark:bg-zinc-900 dark:shadow-zinc-900/50">
                <Header />
                <main className="flex-1 overflow-y-auto overscroll-contain">
                    <ItemList />
                </main>
                <AddItem />
            </div>
        </div>
    );
}

export default App;
