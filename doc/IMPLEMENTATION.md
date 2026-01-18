# Implementation Details

This document outlines the technical architecture and core logic of the ToBuy List application.

## 🛠 Tech Stack
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) + Persistence middleware
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS + [Tailwind CSS](https://tailwindcss.com/)
- **PWA**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)

## 🧠 Core Logic

### 1. Smart Sorting
The app uses a weight-based sorting system. When an item is marked as bought, the app records the sequence. Over time, it learns the order in which you usually pick up items in the store and sorts your list to match your walking path.

### 2. Geolocation & Store Detection
- **`useGeolocation.ts`**: A custom hook that watches the user's position using the browser's Geolocation API.
- **Detection Algorithm**: Uses the Haversine formula to calculate the distance between the user and saved store coordinates.
- **Disambiguation**: If multiple stores are within their respective detection radii (customizable per store), the app prompts the user to select the correct one via a bottom-sheet dialog.

### 3. PWA & Offline Support
- **Service Workers**: Managed by `vite-plugin-pwa` for "Offline Ready" functionality.
- **Persistence**: Zustand's `persist` middleware automatically syncs the application state to `localStorage`.
- **Safe Area**: Uses CSS `env(safe-area-inset-*)` values to ensure the UI respects notches and home indicators on modern iOS and Android devices.

## 📁 Project Structure
```
src/
├── components/     # UI Components (ItemList, StoreManager, etc.)
├── hooks/          # Custom hooks (useGeolocation)
├── store.ts        # Zustand store & global state
├── types.ts        # TypeScript interfaces
├── App.tsx         # Main application entry
└── main.tsx        # React mounting
```
