# To-Buy List PWA - Walkthrough

**Goal**: A mobile-first, offline-capable grocery shopping list app.

## Features Implemented
- **Local-First Storage**: Data persists in your browser (saved to `localStorage`) so you never lose your list.
- **PWA Ready**: Can be installed on mobile/desktop and works offline.
- **Mobile-First App Layout**:
    - **Header**: Shows online/offline status.
    - **Item List**: 
        - **Swipe Right**: Mark as bought (Green check).
        - **Swipe Left**: Delete item (Red trash can).
        - **Left Button**: Tap to toggle bought status.
        - **Smart Sorting**: Items automatically sort based on the order you last bought them!
    - **Add Item**: 
        - Fixed bottom bar for quick entry.
        - **Autocomplete**: Suggests items from your history as you type.
            - Short (1-2 chars): Start typing to see items beginning with those letters.
            - Long (3+ chars): Matches anywhere in the word.
            - **Smart Sorting**: Frequently bought items appear at the top of the list!
            - **Filtered**: Items already on your "Need to Buy" list won't show up in suggestions.
        - **No Duplicates**: Adding an item that's already in the "Bought" list simple brings it back to the top. If it's already pending, nothing happens.
    - **Reorder**: Drag and drop items using the grip icon (⋮) to prioritize your list manually.
- **Shopping Mode**: Bought items move to the bottom and become dimmed.

## How to Run
1. Open your terminal in `c:\my\projects\tobuy-list`.
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Verification & Testing
### 1. Test Offline Mode
- Open Developer Tools (F12) -> Network -> Change throttling to **Offline**.
- Reload the page. The app should still load!
- You can add/remove items while offline.

### 2. Install the App
- In Chrome/Edge, look for the install icon in the address bar (computer) or "Add to Home Screen" in the menu (mobile).
- The app will launch in a standalone window nicely branded with the orange icon.

### 3. Data Persistence
- Add some items to your list.
- Close the tab or browser completely.
- Reopen the app. Your items will still be there.

![App Icon](/app_icon_1768641980563.png)
