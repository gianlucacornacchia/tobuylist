# User Stories

This document outlines the core user stories that define the current feature set and functionality of the ToBuy List PWA.

## List Management & Core Functionality
- **US1:** As a shopper, I want to add a new item to my list by typing its name, so I don't forget it at the store.
- **US2:** As a shopper, I want to mark an item as "bought" by swiping right or tapping a checkbox, so I can keep track of my progress through the store.
- **US3:** As a shopper, I want bought items to visually dim and automatically drop to the bottom of the list, so my focus remains on the items I still need to find.
- **US4:** As a shopper, I want to easily delete items by swiping left, so I can remove mistakes or items I no longer need.
- **US5:** As a shopper, I want to be prevented from adding duplicate items to the active list, so my list stays organized. If I re-add a bought item, it should jump back to the active pending list.
- **US6:** As a shopper, I want to manually reorder items using a drag handle so I can custom-sort my route.

## Quantities & Units
- **US7:** As a shopper, I want to quickly specify quantities and units while adding an item (e.g., "2 Kg Apples" or "Milk 1 L"), so the app automatically parses and saves the exact amount I need.
- **US8:** As a shopper, I want to optionally skip adding a quantity (defaulting to 1 or null), and have the app hide the quantity badge to keep my list visually clean.
- **US9:** As a shopper, I want to be able to tap on an item's name or its quantity badge at any time to open a touch-friendly inline editor with `+` and `-` buttons, so I can adjust the amount on the fly.

## Smart Features & Autocomplete
- **US10:** As a shopper, I want the add-item input to suggest items I've historically bought, so I can populate my list with fewer keystrokes.
- **US11:** As a shopper, I want to tap a suggestion and have it populate the text box (rather than instantly adding it), so I can easily append a quantity before pressing add.
- **US12:** As a shopper, I want the app to learn my habits and "smart sort" my pending items based on the chronological order I typically check them off, so the list naturally predicts my path through the store.

## Connectivity, PWA, & Sharing
- **US13:** As a user, I want to be able to install the app to my phone's home screen as a PWA, so it feels like a native app.
- **US14:** As a shopper in a supermarket with bad cell reception, I want the app to be fully functional offline, persisting my data locally.
- **US15:** As a family member, I want to sync my local list with a shared Supabase backend, so my partner and I can collaboratively view, add, and cross off items in real time.
