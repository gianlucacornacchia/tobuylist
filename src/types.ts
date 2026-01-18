export interface Item {
    id: string;
    name: string;
    isBought: boolean;
    category?: string;
    createdAt: number;
    order: number;
}

export interface Store {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number; // meters
    visitCount: number;
    lastVisit: number; // timestamp
    createdAt: number;
}

export interface StoreVisit {
    storeId: string;
    timestamp: number;
    itemsBought: string[]; // item IDs
}
