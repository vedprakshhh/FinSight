"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Activity } from 'lucide-react';
import { FinancialLine } from './FinancialLine';
import { EventForm } from './EventForm';
import { EventList } from './EventList';

// --- MAIN WRAPPER ---
export default function ThreeWave({ showGoldenPath = false, onNodeClick }: { showGoldenPath?: boolean, onNodeClick?: (event: any) => void }) {
    const [timelineStart, setTimelineStart] = useState(new Date(2026, 1, 28));
    const [showForm, setShowForm] = useState(false);
    const { events } = useStore();

    const periodStats = useMemo(() => {
        const viewEndTime = timelineStart.getTime() + 14 * 86400000;
        const periodEvents = events.filter((e: any) => e.start.getTime() >= timelineStart.getTime() && e.start.getTime() <= viewEndTime);

        let income = 0; let expenses = 0;
        periodEvents.forEach((e: any) => {
            if (e.type === 'income') income += e.predictedCost;
            else expenses += e.predictedCost;
        });

        return { income, expenses, net: income - expenses };
    }, [events, timelineStart]);

    const healthPercent = useMemo(() => {
        if (periodStats.expenses === 0) return 100;
        const ratio = Math.min(periodStats.income / periodStats.expenses, 2);
        return Math.round(ratio * 50);
    }, [periodStats]);

    return (
        <div className="w-full h-full bg-[#020617] rounded-lg overflow-hidden relative shadow-2xl border border-slate-800 flex flex-col">
            <div className="absolute top-0 left-0 w-full p-5 flex justify-between items-start z-10 pointer-events-none">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Timeline Health</div>
                    </div>
                    <div className={`text-4xl font-black tracking-tighter drop-shadow-lg ${healthPercent >= 100 ? 'text-emerald-400' : healthPercent >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {healthPercent}%
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-2 bg-slate-950/60 p-1.5 rounded inline-block backdrop-blur-md border border-slate-800">
                        IN: <span className="text-emerald-400">${periodStats.income}</span> OUT: <span className="text-red-400">${periodStats.expenses}</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 pointer-events-auto">
                    <div className="flex bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                        <button onClick={() => setTimelineStart(subDays(timelineStart, 14))} className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border-r border-slate-700"><ChevronLeft size={16} /></button>
                        <div className="px-5 py-2.5 text-sm font-semibold text-slate-200 min-w-[150px] text-center font-mono">
                            {format(timelineStart, 'MMM dd')} - {format(addDays(timelineStart, 14), 'MMM dd')}
                        </div>
                        <button onClick={() => setTimelineStart(addDays(timelineStart, 14))} className="p-2.5 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border-l border-slate-700"><ChevronRight size={16} /></button>
                    </div>
                    <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-400 rounded-lg text-sm font-bold transition-all border border-emerald-700/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <Plus size={16} /> Inject Data
                    </button>
                </div>
            </div>

            <Canvas
                camera={{ position: [0, 0, 10], fov: 55 }}
                className="w-full h-full pb-20"
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
            >
                <ambientLight intensity={0.2} />
                <FinancialLine startDate={timelineStart} showGoldenPath={showGoldenPath} onNodeClick={onNodeClick} />
                <EffectComposer>
                    <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
                </EffectComposer>
                <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 1.5} autoRotate={false} />
                <Environment preset="night" />
            </Canvas>
            <EventList />
            {showForm && <EventForm onClose={() => setShowForm(false)} />}
        </div>
    );
}
