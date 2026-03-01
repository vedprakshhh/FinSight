"use client";

import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

// --- EVENT LIST COMPONENT ---
export function EventList() {
    const { events, removeEvent, clearAllEvents } = useStore();
    const sortedEvents = [...events].sort((a: any, b: any) => a.start.getTime() - b.start.getTime());

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 max-h-48 overflow-y-auto">
            <div className="p-3 flex items-center justify-between border-b border-slate-800/50 sticky top-0 bg-slate-950/90 z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Active Ledger ({events.length})</span>
                <button onClick={clearAllEvents} className="text-xs px-3 py-1 bg-red-950/50 hover:bg-red-900/50 text-red-400 rounded transition-colors border border-red-900/50">Purge Data</button>
            </div>
            <div className="p-3 flex flex-wrap gap-2">
                {sortedEvents.map((event: any) => (
                    <div key={event.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${event.type === 'income' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' :
                        event.status === 'danger' ? 'bg-red-950/30 text-red-400 border-red-900/50' :
                            event.status === 'warning' ? 'bg-amber-950/30 text-amber-400 border-amber-900/50' :
                                'bg-slate-900/50 text-slate-300 border-slate-700/50'}`}
                    >
                        <span className="font-mono opacity-60">{format(event.start, 'MMM dd')}</span>
                        <span className="font-medium">{event.title}</span>
                        <span className="font-bold font-mono ml-2">{event.type === 'income' ? '+' : '-'}${event.predictedCost}</span>
                        <button onClick={() => removeEvent(event.id)} className="ml-2 hover:text-white transition-colors opacity-50 hover:opacity-100"><Trash2 size={14} /></button>
                    </div>
                ))}
                {events.length === 0 && <div className="text-xs text-slate-600 italic p-2">Ledger is empty. Timeline is flat.</div>}
            </div>
        </div>
    );
}
