import { useState } from 'react';
import { useStore } from '../store';
import { Plus, Users, Trash2, Edit2, Check, X, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ListManager() {
    const lists = useStore(state => state.lists);
    const currentListId = useStore(state => state.currentListId);
    const switchList = useStore(state => state.switchList);
    const createList = useStore(state => state.createList);
    const deleteList = useStore(state => state.deleteList);
    const renameList = useStore(state => state.renameList);
    const joinList = useStore(state => state.joinList);

    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [editingListId, setEditingListId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newListName.trim()) return;
        const result = await createList(newListName.trim());
        setNewListName('');
        setIsCreating(false);

        if (!result.success) {
            alert(result.message);
        }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        const result = await joinList(joinCode.trim().toUpperCase());
        if (result.success) {
            setJoinCode('');
            setIsJoining(false);
        } else {
            alert(result.message || 'Failed to join list');
        }
    };

    const handleRename = async (id: string) => {
        if (!editName.trim()) return;
        await renameList(id, editName.trim());
        setEditingListId(null);
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">My Lists</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsJoining(true)}
                        className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        title="Join List"
                    >
                        <Users size={20} />
                    </button>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        title="Create List"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex gap-2 overflow-hidden"
                    >
                        <input
                            type="text"
                            value={newListName}
                            onChange={(e) => setNewListName(e.target.value)}
                            placeholder="List Name"
                            className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <button onClick={handleCreate} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg">
                            <Check size={20} />
                        </button>
                        <button onClick={() => setIsCreating(false)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                            <X size={20} />
                        </button>
                    </motion.div>
                )}

                {isJoining && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex gap-2 overflow-hidden"
                    >
                        <input
                            type="text"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            placeholder="Enter 6-char Code"
                            className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 uppercase"
                            autoFocus
                            maxLength={6}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        <button onClick={handleJoin} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg">
                            <Check size={20} />
                        </button>
                        <button onClick={() => setIsJoining(false)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-2">
                {lists.map(list => (
                    <div
                        key={list.id}
                        className={`group flex items-center justify-between p-3 rounded-xl transition-all ${currentListId === list.id
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-orange-500/50'
                            }`}
                    >
                        {editingListId === list.id ? (
                            <div className="flex items-center flex-1 gap-2">
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="flex-1 bg-transparent border-b border-white/50 outline-none px-1"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleRename(list.id)}
                                />
                                <button onClick={() => handleRename(list.id)}><Check size={16} /></button>
                                <button onClick={() => setEditingListId(null)}><X size={16} /></button>
                            </div>
                        ) : (
                            <div
                                className="flex-1 cursor-pointer font-medium truncate"
                                onClick={() => switchList(list.id)}
                            >
                                {list.name}
                            </div>
                        )}

                        <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {list.shareCode && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(list.shareCode!); }}
                                    className={`p-1.5 rounded-lg transition-colors ${currentListId === list.id ? 'hover:bg-white/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                    title={`Copy Code: ${list.shareCode}`}
                                >
                                    {copiedCode === list.shareCode ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                </button>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingListId(list.id);
                                    setEditName(list.name);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${currentListId === list.id ? 'hover:bg-white/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                            >
                                <Edit2 size={16} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete this list?')) deleteList(list.id);
                                }}
                                className={`p-1.5 rounded-lg transition-colors hover:text-red-500 ${currentListId === list.id ? 'hover:bg-white/20' : 'hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {lists.length === 0 && (
                    <div className="text-center p-4 text-zinc-500 text-sm">
                        No lists yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}
