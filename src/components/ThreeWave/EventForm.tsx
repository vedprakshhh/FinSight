"use client";

import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';

// --- EVENT FORM COMPONENT ---
export function EventForm({ onClose }: { onClose: () => void }) {
    const { addEvent } = useStore();
    const [title, setTitle] = useState('');
    const [cost, setCost] = useState('');
    const [type, setType] = useState<'income' | 'fixed' | 'variable'>('variable');
    const [date, setDate] = useState(format(new Date(2026, 1, 28), 'yyyy-MM-dd'));
    const [status, setStatus] = useState<'safe' | 'expected' | 'warning' | 'danger'>('expected');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addEvent({
            title,
            start: new Date(date),
            type,
            predictedCost: parseFloat(cost),
            status,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-96 space-y-4 shadow-2xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Plus size={18} className="text-emerald-400" /> Add Timeline Event</h3>
                <div>
                    <label className="text-xs text-slate-400 block mb-1">Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Amount ($)</label>
                        <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500" required />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500" required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500">
                            <option value="income">Income</option>
                            <option value="fixed">Fixed Expense</option>
                            <option value="variable">Variable Expense</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 block mb-1">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500">
                            <option value="safe">Safe</option>
                            <option value="expected">Expected (Fixed)</option>
                            <option value="warning">Warning</option>
                            <option value="danger">Danger</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium transition-colors">Deploy Event</button>
                </div>
            </form>
        </div>
    );
}
