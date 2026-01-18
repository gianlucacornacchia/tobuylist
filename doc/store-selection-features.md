# Store Selection Features - Complete

## New Features

### 1. ✅ Manual Store Selection
Tap the store name (or "Tap to select store") in the header to manually choose your current store.

**Features:**
- Shows all stores sorted by distance
- Displays distance to each store
- "No store selected" option
- Current store highlighted

### 2. ✅ Multi-Store Detection
When multiple stores are within detection radius, the app prompts you to choose.

**Smart Detection Logic:**
- **1 store in range** → Auto-selects automatically
- **2+ stores in range** → Shows disambiguation dialog
- **0 stores in range** → Clears selection

## How It Works

### Automatic Detection

The app continuously monitors your location:

```typescript
if (1 store in range) {
  → Auto-select that store
} else if (2+ stores in range) {
  → Show "Which store are you at?" dialog
} else {
  → Clear store selection
}
```

### Manual Override

Tap the header anytime to:
- Choose a different store
- Clear the selection
- See distances to all stores

## UI Components

### Header (Clickable)
- **With store:** "📍 Store Name" (orange text)
- **Without store:** "Tap to select store" (gray text)
- Tap anywhere on the title area to open selector

### Store Selector Modal
- Full-screen modal with all stores
- Sorted by distance (closest first)
- Shows distance in meters/kilometers
- "No store selected" option at top

### Disambiguation Dialog
- Bottom sheet design
- Shows only stores in range
- Displays distance for each
- "Ask me later" to dismiss

## User Experience

### Scenario 1: Single Store
1. You arrive at a store
2. App detects you're within radius
3. Store auto-selects
4. Name appears in header

### Scenario 2: Multiple Stores
1. You're near 2+ stores (e.g., shopping mall)
2. Dialog appears: "Which store are you at?"
3. Choose your store
4. Selection persists until you leave

### Scenario 3: Manual Selection
1. Tap header anytime
2. Choose from all stores
3. Override automatic detection
4. Stays selected until changed

## Technical Details

### Detection Algorithm

```typescript
findStoresInRange(lat, lon, stores)
  → Returns stores within radius
  → Sorted by distance (closest first)
  → Includes distance in meters
```

### State Management

- `currentStore`: Currently selected store ID
- Manual selection overrides auto-detection
- Selection clears when leaving all store radii

## Benefits

✅ **Flexible** - Manual or automatic selection  
✅ **Smart** - Handles multiple nearby stores  
✅ **Clear** - Always shows current store in header  
✅ **Persistent** - Selection stays until changed  
✅ **Accurate** - Distance-based sorting
