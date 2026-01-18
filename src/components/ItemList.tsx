import { Trash2, Check, CheckSquare, Square, GripVertical } from 'lucide-react';
import { useStore } from '../store';
import type { Item } from '../types';
import { motion, AnimatePresence, useMotionValue, useTransform, Reorder, useDragControls } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

export function ItemList() {
    const items = useStore((state) => state.items);
    const toggleItem = useStore((state) => state.toggleItem);
    const deleteItem = useStore((state) => state.deleteItem);
    const setItems = useStore((state) => state.setItems);

    // Filter pending items and sort by 'order'
    // We treat 'order' as an absolute position for now.
    const pendingItems = items
        .filter((i) => !i.isBought)
        .sort((a, b) => a.order - b.order);

    const boughtItems = items.filter((i) => i.isBought).sort((a, b) => b.createdAt - a.createdAt);

    const handleReorder = (reorderedPendingItems: Item[]) => {
        // reorderedPendingItems has the new order for the pending subset.
        // We need to update the main 'items' array.
        // We will assign new 'order' values to these items to persist this visual order.

        // Strategy: update the 'order' field of these specific items
        // to be sequential based on their new index.
        // We need to keep them relative to each other.
        // To avoid conflict with Smart Sort (which uses Date.now()), we can just use 
        // the current time + index? or just small integers?
        // Since we sort by order ascending, small integers (0, 1, 2) work fine.
        // But newly added items get Date.now() (huge number), so they will go to the bottom.
        // That's acceptable behavior: "Add to bottom".
        // Smart Sort logic said "Historical Rank".

        // Let's rely on the fact that we just want to save THIS order.
        // valid way:
        const updatedPendingItems = reorderedPendingItems.map((item, index) => ({
            ...item,
            order: index // simple 0-based index for the manual list
        }));

        // Now merge back into the full list
        const updatedItems = items.map(item => {
            if (item.isBought) return item; // Don't touch bought items

            // Find this item in the updated pending list
            const updated = updatedPendingItems.find(p => p.id === item.id);
            return updated || item;
        });

        // We also need to handle the case where some items might not be in the reordered list? 
        // No, reorderedPendingItems contains all currently visible pending items.

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
            {pendingItems.length > 0 && (
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
                </div>
            )}

            {boughtItems.length > 0 && (
                <div className="mt-8">
                    <div className="flex items-center justify-between px-4 pb-2">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
                            Bought ({boughtItems.length})
                        </h3>
                    </div>
                    <div className="space-y-1 opacity-60">
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
            )}
        </div>
    );
}

function SwipeableItem({ item, onToggle, onDelete, isBoughtList }: { item: Item; onToggle: () => void; onDelete: () => void; isBoughtList?: boolean }) {
    const x = useMotionValue(0);
    const backgroundOpacity = useTransform(x, [-200, -100, 0, 100, 200], [1, 0, 0, 0, 1]);
    const deleteOpacity = useTransform(x, [-200, -100], [1, 0]);
    const toggleOpacity = useTransform(x, [100, 200], [0, 1]);

    const dragControls = useDragControls();

    // Background colors based on drag direction
    const backgroundColor = useTransform(
        x,
        [-250, -1, 0, 1, 250],
        ['rgb(239, 68, 68)', 'rgb(239, 68, 68)', 'rgba(0,0,0,0)', 'rgb(34, 197, 94)', 'rgb(34, 197, 94)']
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
                style={{ backgroundColor, opacity: backgroundOpacity }}
                className="absolute inset-0 flex items-center justify-between px-6"
            >
                <motion.div style={{ opacity: toggleOpacity }} className="flex items-center gap-2 text-white font-medium">
                    <Check size={20} strokeWidth={3} />
                    <span>{item.isBought ? 'To buy' : 'Bought'}</span>
                </motion.div>
                <motion.div style={{ opacity: deleteOpacity }} className="flex items-center gap-2 text-white font-medium">
                    <span>Delete</span>
                    <Trash2 size={20} />
                </motion.div>
            </motion.div>

            {/* Foreground Item */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={`relative flex items-center justify-between border-b border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${item.isBought ? 'bg-zinc-50 dark:bg-zinc-900/50' : ''
                    }`}
            >
                <div className="flex flex-1 items-center gap-4">
                    {/* Drag Handle (Only for pending items) */}
                    {!isBoughtList && (
                        <div
                            onPointerDown={(e) => dragControls.start(e)}
                            className="flex h-10 w-6 cursor-grab touch-none items-center justify-center text-zinc-300 active:cursor-grabbing dark:text-zinc-600"
                        >
                            <GripVertical size={20} />
                        </div>
                    )}

                    {/* Explicit Button Control */}
                    <button
                        onClick={onToggle}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${item.isBought
                            ? 'text-green-500 hover:text-green-600'
                            : 'text-zinc-400 hover:text-orange-500 dark:text-zinc-500'
                            }`}
                        aria-label={item.isBought ? "Unmark as bought" : "Mark as bought"}
                        // Prevent drag when clicking button
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        {item.isBought ? (
                            <CheckSquare size={24} strokeWidth={2.5} />
                        ) : (
                            <Square size={24} strokeWidth={2} />
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
