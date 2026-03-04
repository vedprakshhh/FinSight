"use client";

import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { Trash2, ChevronUp, ChevronDown, Eye, Edit2, Check, X } from 'lucide-react';
import { useState } from 'react';

// --- EVENT LIST COMPONENT ---
export function EventList({ timelineStart, daysShown = 14 }: { timelineStart: Date, daysShown?: number }) {
    const { events, removeEvent, clearAllEvents, updateEvent } = useStore();
    const [isExpanded, setIsExpanded] = useState(true);
    const [viewAll, setViewAll] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', predictedCost: 0 });

    const handleEdit = (event: any) => {
        setEditingId(event.id);
        setEditForm({ title: event.title, predictedCost: event.predictedCost });
    };

    const handleSave = () => {
        if (editingId) {
            updateEvent(editingId, {
                title: editForm.title,
                predictedCost: Number(editForm.predictedCost) || 0
            });
            setEditingId(null);
        }
    };

    // Sort all events
    const sortedEvents = [...events].sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

    // Filter events
    const visibleEvents = viewAll ? sortedEvents : sortedEvents.filter((e: any) => {
        const time = e.start.getTime();
        const start = timelineStart.getTime();
        const end = start + daysShown * 86400000;
        return time >= start && time <= end;
    });

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-transparent flex flex-col items-center pointer-events-none z-50">
            {/* Control Bar */}
            <div className="p-2 flex items-center justify-center gap-3 bg-transparent rounded-t-xl border-t border-x border-slate-800 pointer-events-auto">
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors border border-slate-700">
                    {isExpanded ? <><ChevronDown size={14} /> Hide Pebbles</> : <><ChevronUp size={14} /> Show Pebbles</>}
                </button>
                <button onClick={() => setViewAll(!viewAll)} className={`flex items-center gap-1 text-xs px-3 py-1 rounded transition-colors border ${viewAll ? 'bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-300 border-indigo-700/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}`}>
                    <Eye size={14} /> {viewAll ? 'Viewing All' : 'Viewing This Period'}
                </button>
                <button onClick={clearAllEvents} className="text-xs px-3 py-1 bg-red-950/50 hover:bg-red-900/50 text-red-400 rounded transition-colors border border-red-900/50">Purge Data</button>
            </div>

            {/* Expanded List */}
            {isExpanded && (
                <div className="w-full bg-transparent border-t border-slate-800 max-h-48 overflow-y-auto pointer-events-auto">
                    <div className="p-3 flex flex-wrap justify-center gap-2">
                        {visibleEvents.map((event: any) => (
                            <div key={event.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${event.type === 'income' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' :
                                event.status === 'danger' ? 'bg-red-950/30 text-red-400 border-red-900/50' :
                                    event.status === 'warning' ? 'bg-amber-950/30 text-amber-400 border-amber-900/50' :
                                        'bg-slate-900/50 text-slate-300 border-slate-700/50'}`}
                            >
                                {editingId === event.id ? (
                                    <div className="flex items-center gap-2 min-w-[200px]">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none text-white w-28"
                                        />
                                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white">
                                            <span className="opacity-50">$</span>
                                            <input
                                                type="number"
                                                value={editForm.predictedCost}
                                                onChange={(e) => setEditForm({ ...editForm, predictedCost: parseFloat(e.target.value) })}
                                                className="bg-transparent outline-none w-14 appearance-none"
                                            />
                                        </div>
                                        <button onClick={handleSave} className="hover:text-emerald-400 transition-colors bg-emerald-950/50 p-1.5 rounded"><Check size={14} /></button>
                                        <button onClick={() => setEditingId(null)} className="hover:text-red-400 transition-colors bg-red-950/50 p-1.5 rounded"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="font-mono opacity-60">{format(event.start, 'MMM dd')}</span>
                                        <span className="font-medium">{event.title}</span>
                                        <span className="font-bold font-mono ml-2">{event.type === 'income' ? '+' : '-'}${event.predictedCost}</span>
                                        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                                            <button onClick={() => handleEdit(event)} className="hover:text-white transition-colors opacity-50 hover:opacity-100"><Edit2 size={13} /></button>
                                            <button onClick={() => removeEvent(event.id)} className="hover:text-red-400 transition-colors opacity-50 hover:opacity-100"><Trash2 size={13} /></button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {visibleEvents.length === 0 && <div className="text-xs text-slate-500 italic p-2 w-full text-center">No pebbles in this view.</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
