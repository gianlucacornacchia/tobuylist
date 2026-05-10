import { useState, useEffect } from 'react';
import { Trash2, Check, CheckSquare, Square, GripVertical } from 'lucide-react';
import { useStore } from '../store';
import type { Item } from '../types';
import { motion, AnimatePresence, useMotionValue, useTransform, Reorder, useDragControls, animate } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

export function ItemList({ onEditingQuantityChange }: { onEditingQuantityChange?: (editing: boolean) => void }) {
    const items = useStore((state) => state.items);
    const currentListId = useStore((state) => state.currentListId);
    const toggleItem = useStore((state) => state.toggleItem);
    const deleteItem = useStore((state) => state.deleteItem);
    const setItems = useStore((state) => state.setItems);
    const updateItemQuantity = useStore((state) => state.updateItemQuantity);

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
        <div className="h-full overflow-y-scroll pb-24 overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
            <div className="space-y-1">
                <Reorder.Group as="div" axis="y" values={pendingItems} onReorder={handleReorder}>
                    {pendingItems.map((item) => (
                        <SwipeableItem
                            key={item.id}
                            item={item}
                            onToggle={() => toggleItem(item.id)}
                            onDelete={() => deleteItem(item.id)}
                            onUpdateQuantity={(qty, unit) => updateItemQuantity(item.id, qty, unit)}
                            onEditingQuantityChange={onEditingQuantityChange}
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
                                onUpdateQuantity={(qty, unit) => updateItemQuantity(item.id, qty, unit)}
                                onEditingQuantityChange={onEditingQuantityChange}
                                isBoughtList
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function SwipeableItem({ item, onToggle, onDelete, onUpdateQuantity, onEditingQuantityChange, isBoughtList }: { item: Item; onToggle: () => void; onDelete: () => void; onUpdateQuantity: (qty: number | undefined, unit: string | undefined) => void; onEditingQuantityChange?: (editing: boolean) => void; isBoughtList?: boolean }) {
    const x = useMotionValue(0);
    const [isEditingQty, setIsEditingQty] = useState(false);

    const handleSetIsEditingQty = (editing: boolean) => {
        setIsEditingQty(editing);
        onEditingQuantityChange?.(editing);
    };

    const dragControls = useDragControls();

    // Background colors based on drag direction - solid colors, no opacity
    const backgroundColor = useTransform(
        x,
        [-1, 0, 1],
        ['rgb(239, 68, 68)', 'rgba(0,0,0,0)', 'rgb(34, 197, 94)']
    );

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x < -100) {
            onDelete();
        } else if (info.offset.x > 100) {
            onToggle();
        }
        // Always spring back to center
        animate(x, 0, { type: 'spring', bounce: 0.2, duration: 0.4 });
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
                dragDirectionLock
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
                        onClick={() => handleSetIsEditingQty(true)}
                        className={`text-base font-medium transition-all select-none flex-1 truncate cursor-pointer ${item.isBought
                            ? 'text-zinc-400 line-through dark:text-zinc-500'
                            : 'text-zinc-900 dark:text-zinc-100'
                            }`}
                    >
                        {item.name}
                    </span>
                    <QuantityEditor item={item} onChange={onUpdateQuantity} isEditing={isEditingQty} setIsEditing={handleSetIsEditingQty} />
                </div>
            </motion.div>
        </motion.div>
    );

    if (isBoughtList) {
        return content;
    }

    return (
        <Reorder.Item
            as="div"
            value={item}
            id={item.id}
            dragListener={false}
            dragControls={dragControls}
        >
            {content}
        </Reorder.Item>
    );
}

function QuantityEditor({ item, onChange, isEditing, setIsEditing }: { item: Item, onChange: (qty: number | undefined, unit: string | undefined) => void, isEditing: boolean, setIsEditing: (v: boolean) => void }) {
    const [qty, setQty] = useState(item.quantity?.toString() || '');
    const [unit, setUnit] = useState(item.unit || '');

    // Sync input state when edit mode opens
    useEffect(() => {
        if (isEditing) {
            setQty(item.quantity?.toString() || '');
            setUnit(item.unit || '');
        }
    }, [isEditing, item.quantity, item.unit]);

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        setIsEditing(true); 
        setQty(item.quantity?.toString() || ''); 
        setUnit(item.unit || '');
    };

    const handleSave = () => {
        setIsEditing(false);
        const parsed = parseFloat(qty);
        onChange(isNaN(parsed) || qty === '' ? undefined : parsed, unit === '' ? undefined : unit);
    };

    if (!isEditing) {
        if (!item.quantity || (item.quantity === 1 && !item.unit)) return null;

        return (
            <button 
                onClick={handleOpen}
                onPointerDown={(e) => e.stopPropagation()}
                className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400`}
            >
                {`${item.quantity} ${item.unit || ''}`.trim()}
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1 flex-shrink-0" onPointerDown={(e) => e.stopPropagation()}>
            <button 
                onClick={() => setQty(String((parseFloat(qty) || 0) + 1))} 
                className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 active:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            >
                +
            </button>
            <input 
                type="number"
                inputMode="decimal"
                value={qty} 
                onChange={e => setQty(e.target.value)}
                className="w-10 px-0 py-1 text-center text-sm bg-transparent outline-none dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
                autoFocus
            />
            <button 
                onClick={() => setQty(String(Math.max(0, (parseFloat(qty) || 0) - 1)))} 
                className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 active:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            >
                -
            </button>
            <select 
                value={unit} 
                onChange={e => setUnit(e.target.value)}
                className="px-2 py-1 text-sm rounded-full appearance-none bg-zinc-100 text-center outline-none active:bg-zinc-200 dark:bg-zinc-800 dark:text-white"
            >
                <option value="">unit</option>
                <option value="Kg">Kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
            </select>
            <button onClick={handleSave} className="ml-1 p-1.5 rounded-full text-green-600 bg-green-50 hover:bg-green-100 active:scale-95 dark:text-green-500 dark:bg-green-500/10 dark:hover:bg-green-500/20">
                <Check size={16} strokeWidth={3} />
            </button>
        </div>
    );
}
