# User Stories

This document outlines the core user stories that define the current feature set and functionality of the ToBuy List PWA. These stories are comprehensive enough to rebuild the application from scratch.

---

## 1. Application Shell & Layout
- **US1:** As a user, I want the app to display as a single full-screen view optimised for mobile, with a fixed header at the top, a scrollable item list in the middle, and a floating add button in the bottom-right corner.
- **US2:** As a user, I want the app to support light and dark mode automatically based on my system preference.
- **US3:** As a user, I want the header to show the current list name and a hamburger menu button. The side menu contains sync controls, settings, and the version number.
- **US4:** As a user on iOS, I want the app to correctly handle the virtual keyboard without pushing the input field or content off-screen. The visible area must resize to match the visual viewport, and the fixed container must stay anchored to the visible area.

## 2. Item Management
- **US5:** As a shopper, I want to add a new item to my list by typing its name in the bottom search box and pressing the add button, so I don't forget it at the store.
- **US6:** As a shopper, I want to mark an item as "bought" by swiping right or tapping the checkbox, so I can keep track of my progress through the store.
- **US7:** As a shopper, I want bought items to visually dim (reduced opacity, strikethrough text) and automatically drop to the bottom of the list, so my focus remains on the items I still need to find.
- **US8:** As a shopper, I want bought items sorted by creation date (most recent first), while pending items are sorted by their custom order.
- **US9:** As a shopper, I want to delete items by swiping left, so I can remove mistakes or items I no longer need.
- **US10:** As a shopper, I want to be prevented from adding duplicate items to the active list. If I re-add the name of a bought item, it should jump back to the pending list instead of creating a duplicate.
- **US11:** As a shopper, I want to manually reorder pending items using a drag handle on the left side of each row, so I can custom-sort my shopping route.
- **US12:** As a shopper, I want to see an empty state illustration ("Your list is empty") with a prompt to add items when no items exist in the current list.

## 3. Swipe Gestures
- **US13:** As a shopper, I want to see a green "Bought" background when swiping an item to the right, so I have visual feedback before the action completes.
- **US14:** As a shopper, I want to see a red "Delete" background when swiping an item to the left, so I have visual feedback before the action completes.
- **US15:** As a shopper, I want the swipe action to trigger only when I drag past a 100px threshold; otherwise the item should spring back to its original position.
- **US16:** As a shopper, I want the item row to animate smoothly (spring physics) back to center after any swipe, whether the action was triggered or not.

## 4. Quantities & Units
- **US17:** As a shopper, I want to quickly specify quantities and units while adding an item using natural language (e.g., "2 Kg Apples", "Milk 1 L", "3 Bread"), so the app automatically parses and saves the exact amount I need.
- **US18:** As a shopper, I want the parser to support both prefix format ("2 Kg Apples") and suffix format ("Apples 2 Kg"), with supported units being Kg, g, and L (case-insensitive input, normalized to Kg/g/L on save).
- **US19:** As a shopper, I want to optionally skip adding a quantity, and have the app hide the quantity badge when the quantity is 1 with no unit, to keep my list visually clean.
- **US20:** As a shopper, I want to tap on an item's name or its quantity badge to open a touch-friendly inline editor with `+` / `−` buttons, a numeric input, and a unit selector dropdown, so I can adjust the amount on the fly.
- **US21:** As a shopper, I want the quantity editor to show a compact numeric keyboard with the decimal separator (comma or period depending on locale), so I can enter fractional quantities like 0.5 or 1,5.
- **US22:** As a shopper, I want the quantity field to accept both commas and periods as decimal separators, with the value normalized internally, so the app works correctly regardless of my locale.
- **US23:** As a shopper, I want the quantity field to reject non-numeric characters (only digits and one decimal separator allowed), preventing invalid input.
- **US24:** As a shopper, I want the "Add item" search box to be hidden while I'm editing a quantity, so the keyboard and quantity editor are not competing for screen space. The search box should reappear when I close the editor.

## 5. Search Box / Add Item Input
- **US25:** As a shopper, I want a floating action button ("+") in the bottom-right corner that opens the add-item search bar when tapped.
- **US25b:** As a shopper, I want the search bar to remain open after adding an item, so I can add multiple items in a row without re-opening it.
- **US25c:** As a shopper, I want an "X" close button next to the input to dismiss the search bar when I'm done adding items.
- **US26:** As a shopper, I want the search box to show a standard alphanumeric keyboard when focused, since I need to type item names, quantities, and units in free-form text.
- **US27:** As a shopper on iOS, I want the search box to remain visible when the virtual keyboard opens, so I can see what I'm typing and not have the input pushed off-screen.
- **US28:** As a shopper, I want the FAB to be hidden when the side menu or settings dialog is open, to avoid accidental input.

## 6. Smart Suggestions & Autocomplete
- **US29:** As a shopper, I want the add-item input to show a suggestion popup (up to 3 items) above the search box as I type, drawn from my purchase history, sorted by frequency (most-bought first), so I can populate my list with fewer keystrokes.
- **US30:** As a shopper, I want suggestions to be filtered so they don't include items already active (pending) in the current list, avoiding accidental duplicates.
- **US31:** As a shopper, I want short searches (fewer than 3 characters) to only match items that start with my input, while longer searches match anywhere in the item name, to reduce noisy results.
- **US32:** As a shopper, I want to tap a suggestion to populate the text field with the suggestion text followed by a space (not submit it), so I can optionally append a quantity before pressing add.

## 7. Smart Sort
- **US33:** As a shopper, I want the app to learn my habits by recording a timestamp rank each time I mark an item as bought. When I add an item next time, it should be sorted by its last-bought rank, predicting my path through the store.
- **US34:** As a shopper, I want items that have never been bought before to sort by their creation timestamp, appearing at a natural position in the list.
- **US35:** As a shopper, I want the app to track a buy count per item name, so suggestions can be sorted by how frequently I purchase each item.

## 8. Multiple Lists
- **US36:** As a user, I want to create multiple named shopping lists, each with its own set of items, so I can manage separate lists (e.g., weekly groceries, party supplies).
- **US37:** As a user, I want each new list to automatically receive a 6-character alphanumeric share code for collaboration.
- **US38:** As a user, I want to switch between lists by tapping a list name in the side menu. The app should load and display items for the selected list.
- **US39:** As a user, I want to rename any list by tapping an edit button next to it, editing the name inline, and pressing Enter or the confirm button.
- **US40:** As a user, I want to delete a list (with a confirmation prompt). When deleting the currently active list, the app should switch to the next available list.
- **US41:** As a user, I want to join a shared list by entering its 6-character share code. The app fetches the list from the server and adds it to my local list collection.
- **US42:** As a user, I want to see the share code displayed next to each list with a copy-to-clipboard button, so I can easily share it with family members.
- **US43:** As a user, I want the app to auto-create a default list called "My List" if I add an item when no list exists.

## 9. Side Menu
- **US44:** As a user, I want to open a slide-in drawer from the left by tapping the hamburger menu icon. The drawer should overlay the content with a dark backdrop.
- **US45:** As a user, I want the side menu to contain: a "My Lists" section (with list management), a divider, and a "Store Manager" navigation button.
- **US46:** As a user, I want to close the menu by tapping the X button or tapping the backdrop outside the drawer.

## 10. Store Manager & Geolocation
- **US47:** As a user, I want to navigate to a "Store Manager" page from the side menu, where I can see all saved stores with their name, visit count, last visit date, and detection radius.
- **US48:** As a user, I want to add a new store by providing a name, capturing my current GPS location, and setting a detection radius (50–500m via a slider, step 10m, default 100m).
- **US49:** As a user, I want to edit an existing store's name, location, and radius.
- **US50:** As a user, I want to delete a store (with a confirmation prompt).
- **US51:** As a user, I want the app to continuously watch my GPS position in the background and automatically select the closest store when I'm within its detection radius.
- **US52:** As a user, I want a disambiguation dialog when multiple stores' radii overlap at my current position, asking "Which store are you at?" with stores listed by distance.
- **US53:** As a user, I want geolocation to use low-accuracy mode with a 10-second timeout and 1-minute position cache, to save battery.
- **US54:** As a user, I want to see an empty state ("No stores yet") when no stores have been configured.

## 11. Connectivity, PWA & Offline
- **US55:** As a user, I want to install the app to my phone's home screen as a PWA, with proper icons (192px, 512px), app name ("ToBuy - Shopping List"), and theme color.
- **US56:** As a shopper in a supermarket with bad cell reception, I want the app to be fully functional offline. All data is persisted locally using browser storage (Zustand + localStorage).
- **US57:** As a user, I want the PWA service worker to auto-update, so I always get the latest version without manual intervention.

## 12. Supabase Sync & Real-Time Collaboration
- **US58:** As a user, I want to configure Supabase sync by entering a Project URL and Anon Key in a settings dialog accessible from the menu.
- **US59:** As a user, I want the Anon Key field to be masked (password input) for security.
- **US60:** As a user, I want to see a "Sync Setup" button in the menu when Supabase is not configured, and a "Sync Now" + settings button when it is configured.
- **US61:** As a user, I want the sync icon to spin while a sync operation is in progress.
- **US62:** As a user, I want the app to perform an initial full sync (push local changes, then pull remote changes) when Supabase credentials are first configured or when the app starts with valid credentials.
- **US63:** As a family member, I want real-time collaboration: when another device adds, updates, or deletes an item on the same list, my view should update automatically via Supabase Realtime (Postgres Changes).
- **US64:** As a user, I want to manually trigger a sync by tapping the "Sync Now" button in the menu.
- **US65:** As a user, I want to disconnect from Supabase by pressing a "Disconnect" button in the settings dialog, clearing the stored credentials.
- **US66:** As a user, I want to share my Supabase configuration with another device by generating a QR code that encodes the Project URL and Anon Key (Base64-encoded in URL parameters).
- **US66b:** As a user, I want to scan a QR code using my device camera from the Sync Setup dialog to automatically extract and apply Supabase credentials without manual entry.
- **US67:** As a user, I want to receive a Supabase configuration automatically when I open the app via a shared URL containing `?su=...&sk=...` parameters (Magic Link). The URL parameters should be cleared after applying.
- **US68:** As a user, I want the app to subscribe to real-time changes only for the currently active list, ignoring events for other lists.

## 13. Data Model
- **US69:** Each **List** has: id (UUID), name, shareCode (6-char alphanumeric), createdAt (timestamp).
- **US70:** Each **Item** has: id (UUID), listId (FK to List), name, isBought (boolean), category (optional), createdAt (timestamp), order (number for sorting), quantity (optional number), unit (optional string: Kg/g/L).
- **US71:** Each **Store** has: id (UUID), name, latitude, longitude, radius (meters), visitCount, lastVisit (timestamp), createdAt (timestamp).
- **US72:** The app maintains a global **itemHistory** (array of previously added item names), **itemRanks** (map of item name → last-bought timestamp for smart sort), and **itemBuyCounts** (map of item name → purchase frequency count).
- **US73:** All local state is persisted to localStorage under the key `tobuy-storage` using Zustand's persist middleware.

## 14. Input Fields by Screen

### Add Item (FAB + expandable bar)
| Field | Keyboard shown | Notes |
|-------|----------------|-------|
| Item name | Standard alphanumeric | Supports inline quantity parsing (e.g., "2 Kg Apples") |

### Quantity Editor (inline on item row)
| Field | Keyboard shown | Notes |
|-------|----------------|-------|
| Quantity | Compact numeric with decimal separator | Accepts digits and one decimal separator (comma or period); normalized to dot on save |
| Unit | Native picker (dropdown) | Options: (none), Kg, g, L |

### List Manager (side menu)
| Field | Keyboard shown | Notes |
|-------|----------------|-------|
| New list name | Standard alphanumeric | Submit on Enter; auto-focused |
| Join code | Standard alphanumeric | Max 6 characters, uppercase; submit on Enter |
| Rename list | Standard alphanumeric | Inline edit; submit on Enter |

### Store Form
| Field | Keyboard shown | Notes |
|-------|----------------|-------|
| Store name | Standard alphanumeric | Required |
| Detection radius | Slider (no keyboard) | 50–500m, step 10m |

### Settings (Header dialog)
| Field | Keyboard shown | Notes |
|-------|----------------|-------|
| Supabase Project URL | Standard alphanumeric | URL value |
| Supabase Anon Key | Standard alphanumeric | Masked (password) |
