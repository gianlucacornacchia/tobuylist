import { Trash2, Check, CheckSquare, Square, GripVertical } from 'lucide-react';
import { useStore } from '../store';
import type { Item } from '../types';
import { motion, AnimatePresence, useMotionValue, useTransform, Reorder, useDragControls } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

export function ItemList() {
    const items = useStore((state) => state.items);
    const currentListId = useStore((state) => state.currentListId);
    const toggleItem = useStore((state) => state.toggleItem);
    const deleteItem = useStore((state) => state.deleteItem);
    const setItems = useStore((state) => state.setItems);

    const listItems = items.filter(i => i.listId === currentListId);

    // Sort items: pending items by order, then bought items by createdAt (most recent first)
    const sortedItems = [...listItems].sort((a, b) => {
        // If both are bought or both are pending, sort by their respective criteria
        if (a.isBought === b.isBought) {
            if (a.isBought) {
                // Both bought: sort by createdAt descending (most recent first)
                return b.createdAt - a.createdAt;
            } else {
                // Both pending: sort by order ascending
                return a.order - b.order;
            }
        }
        // Pending items come before bought items
        return a.isBought ? 1 : -1;
    });

    const pendingItems = sortedItems.filter((i) => !i.isBought);
    const boughtItems = sortedItems.filter((i) => i.isBought);

    const handleReorder = (reorderedPendingItems: Item[]) => {
        // Update order for pending items
        const updatedPendingItems = reorderedPendingItems.map((item, index) => ({
            ...item,
            order: index
        }));

        // Merge back into the full list
        const updatedItems = items.map(item => {
            if (item.isBought) return item;
            const updated = updatedPendingItems.find(p => p.id === item.id);
            return updated || item;
        });

        setItems(updatedItems);
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 text-6xl">🛒</div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    Your list is empty
                </h3>
                <p className="text-zinc-500">
                    Add some items to get started!
                </p>
            </div>
        );
    }

    return (
        <div className="pb-24 overflow-x-hidden">
            <div className="space-y-1">
                <Reorder.Group axis="y" values={pendingItems} onReorder={handleReorder}>
                    {pendingItems.map((item) => (
                        <SwipeableItem
                            key={item.id}
                            item={item}
                            onToggle={() => toggleItem(item.id)}
                            onDelete={() => deleteItem(item.id)}
                        />
                    ))}
                </Reorder.Group>

                <div className="opacity-70">
                    <AnimatePresence initial={false}>
                        {boughtItems.map((item) => (
                            <SwipeableItem
                                key={item.id}
                                item={item}
                                onToggle={() => toggleItem(item.id)}
                                onDelete={() => deleteItem(item.id)}
                                isBoughtList
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function SwipeableItem({ item, onToggle, onDelete, isBoughtList }: { item: Item; onToggle: () => void; onDelete: () => void; isBoughtList?: boolean }) {
    const x = useMotionValue(0);

    const dragControls = useDragControls();

    // Background colors based on drag direction - solid colors, no opacity
    const backgroundColor = useTransform(
        x,
        [-1, 0, 1],
        ['rgb(239, 68, 68)', 'rgba(0,0,0,0)', 'rgb(34, 197, 94)']
    );

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x < -200) {
            onDelete();
        } else if (info.offset.x > 200) {
            onToggle();
        }
    };

    const content = (
        <motion.div
            className="relative overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Background Actions */}
            <motion.div
                style={{ backgroundColor }}
                className="absolute inset-0 flex items-center justify-between px-6"
            >
                <div className="flex items-center gap-2 text-white font-medium">
                    <Check size={20} strokeWidth={3} />
                    <span>{item.isBought ? 'To buy' : 'Bought'}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-medium">
                    <span>Delete</span>
                    <Trash2 size={20} />
                </div>
            </motion.div>

            {/* Foreground Item */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={`relative flex items-center justify-between border-b border-zinc-100 bg-white py-2 px-4 dark:border-zinc-800 dark:bg-zinc-900 ${item.isBought ? 'bg-zinc-50' : ''
                    }`}
            >
                <div className="flex flex-1 items-center gap-3">
                    {/* Drag Handle (Only for pending items) */}
                    {!isBoughtList && (
                        <div
                            onPointerDown={(e) => dragControls.start(e)}
                            className="flex h-11 w-5 cursor-grab touch-none items-center justify-center text-zinc-300 active:cursor-grabbing dark:text-zinc-600"
                        >
                            <GripVertical size={18} />
                        </div>
                    )}

                    {/* Explicit Button Control */}
                    <button
                        onClick={onToggle}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-95 ${item.isBought
                            ? 'text-green-500 active:text-green-600'
                            : 'text-zinc-400 active:text-orange-500 dark:text-zinc-500'
                            }`}
                        aria-label={item.isBought ? "Unmark as bought" : "Mark as bought"}
                        // Prevent drag when clicking button
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {item.isBought ? (
                            <CheckSquare size={22} strokeWidth={2.5} />
                        ) : (
                            <Square size={22} strokeWidth={2} />
                        )}
                    </button>

                    <span
                        className={`text-base font-medium transition-all select-none ${item.isBought
                            ? 'text-zinc-400 line-through dark:text-zinc-500'
                            : 'text-zinc-900 dark:text-zinc-100'
                            }`}
                    >
                        {item.name}
                    </span>
                </div>
            </motion.div>
        </motion.div>
    );

    if (isBoughtList) {
        return content;
    }

    // For reorderable items, we use Reorder.Item
    return (
        <Reorder.Item value={item} id={item.id} dragListener={false} dragControls={dragControls}>
            {content}
        </Reorder.Item>
    );
}
