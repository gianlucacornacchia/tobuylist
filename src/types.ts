export interface Item {
    id: string;
    name: string;
    isBought: boolean;
    category?: string;
    createdAt: number;
    order: number;
}
