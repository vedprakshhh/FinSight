"use client";

import { useMemo, useState } from 'react';
import { useStore } from '@/src/store/useStore';
import { Trophy, ChevronRight, Lock, Flame, ShieldCheck, ChefHat, TrendingUp, Heart, Zap, Star, Award, X } from 'lucide-react';

// ─────────────────────────────────────────────
//  BADGE DEFINITIONS
// ─────────────────────────────────────────────
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'legendary';

export interface BadgeDef {
    id: string;
    name: string;
    description: string; flavor: string;           // lore / poetic subtitle shown on hover
    icon: React.ReactNode;
    tier: BadgeTier;
    check: (events: any[], user: any) => { earned: boolean; progress: number; total: number; detail?: string };
}

const BADGE_DEFS: BadgeDef[] = [
    // ── GREEN STREAK ──────────────────────────────────────────────────
    {
        id: 'green_week',
        name: 'Green Horizon',
        description: 'Stay in the green (no danger events) for 7 consecutive days.',
        flavor: '"Flatlines are for hospitals. Your line only rises."',
        icon: <Flame className="w-5 h-5" />,
        tier: 'silver',
        check: (events) => {
            const dangerDates = new Set(
                events
                    .filter((e: any) => e.status === 'danger')
                    .map((e: any) => Math.floor(e.start.getTime() / 86400000))
            );
            // Walk last 7 distinct calendar days in the data range
            const today = Math.floor(new Date(2026, 1, 28).getTime() / 86400000);
            let streak = 0;
            for (let d = today; d < today + 14; d++) {
                if (!dangerDates.has(d)) streak++;
                else streak = 0;
            }
            const earned = streak >= 7;
            return { earned, progress: Math.min(streak, 7), total: 7, detail: `${streak} day streak` };
        },
    },
    {
        id: 'green_fortnight',
        name: 'Iron Will',
        description: 'No danger events across an entire 14-day window.',
        flavor: '"Discipline is just a habit wearing armour."',
        icon: <ShieldCheck className="w-5 h-5" />,
        tier: 'gold',
        check: (events, user) => {
            const dangerCount = events.filter((e: any) => e.status === 'danger').length;
            const earned = dangerCount === 0 && events.length > 0;
            return { earned, progress: earned ? 14 : Math.max(0, 14 - dangerCount * 3), total: 14 };
        },
    },

    // ── HOME CHEF ─────────────────────────────────────────────────────
    {
        id: 'home_chef',
        name: 'Home Chef',
        description: 'Log a "cook at home" or "groceries" event for 7 days in a row.',
        flavor: '"The most expensive meal is the one you didn\'t make yourself."',
        icon: <ChefHat className="w-5 h-5" />,
        tier: 'silver',
        check: (events) => {
            const homeKeywords = ['cook', 'groceries', 'grocery', 'home meal', 'meal prep', 'cooking'];
            const homeDays = new Set(
                events
                    .filter((e: any) => homeKeywords.some(kw => e.title?.toLowerCase().includes(kw)))
                    .map((e: any) => Math.floor(e.start.getTime() / 86400000))
            );
            const count = homeDays.size;
            return { earned: count >= 7, progress: Math.min(count, 7), total: 7, detail: `${count} home meals logged` };
        },
    },
    {
        id: 'master_chef',
        name: 'Master Chef',
        description: 'Log "cook at home" events for every day of a 14-day period.',
        flavor: '"Gordon Ramsay pays his rent too."',
        icon: <Star className="w-5 h-5" />,
        tier: 'legendary',
        check: (events) => {
            const homeKeywords = ['cook', 'groceries', 'grocery', 'home meal', 'meal prep', 'cooking'];
            const homeDays = new Set(
                events
                    .filter((e: any) => homeKeywords.some(kw => e.title?.toLowerCase().includes(kw)))
                    .map((e: any) => Math.floor(e.start.getTime() / 86400000))
            );
            const count = homeDays.size;
            return { earned: count >= 14, progress: Math.min(count, 14), total: 14 };
        },
    },

    // ── INCOME OPTIMIZER ──────────────────────────────────────────────
    {
        id: 'income_positive',
        name: 'Cash Flow Positive',
        description: 'Have more income than expenses across any 14-day period.',
        flavor: '"Revenue minus cost. The oldest math in the world."',
        icon: <TrendingUp className="w-5 h-5" />,
        tier: 'bronze',
        check: (events, user) => {
            let income = 0; let expenses = 0;
            events.forEach((e: any) => {
                if (e.type === 'income') income += e.predictedCost;
                else expenses += e.predictedCost;
            });
            const net = income - expenses;
            const earned = net > 0;
            const progress = earned ? 100 : Math.max(0, Math.round((income / (expenses || 1)) * 100));
            return { earned, progress, total: 100, detail: `Net: ${net >= 0 ? '+' : ''}$${net.toFixed(0)}` };
        },
    },

    // ── RECOVERY STAR ────────────────────────────────────────────────
    {
        id: 'recovery_star',
        name: 'Recovery Star',
        description: 'Accept an AI Rebalance plan after a financial emergency.',
        flavor: '"The fall doesn\'t define you. The bounce does."',
        icon: <Zap className="w-5 h-5" />,
        tier: 'gold',
        check: (_events, user) => {
            const earned = !!user?.hasAcceptedRebalance;
            return { earned, progress: earned ? 1 : 0, total: 1 };
        },
    },

    // ── SOCIAL SAVER ─────────────────────────────────────────────────
    {
        id: 'social_saver',
        name: 'Social Saver',
        description: 'Use the AI cost-split feature on 3 separate events.',
        flavor: '"Why pay full price when you can split the bill and the memory?"',
        icon: <Heart className="w-5 h-5" />,
        tier: 'silver',
        check: (_events, user) => {
            const count = user?.costSplitCount ?? 0;
            return { earned: count >= 3, progress: Math.min(count, 3), total: 3, detail: `${count}/3 splits used` };
        },
    },

    // ── BUDGET GUARDIAN ───────────────────────────────────────────────
    {
        id: 'budget_guardian',
        name: 'Budget Guardian',
        description: 'Keep Timeline Health above 80% for an entire 14-day window.',
        flavor: '"A budget is telling your money where to go instead of wondering where it went."',
        icon: <Award className="w-5 h-5" />,
        tier: 'legendary',
        check: (events, user) => {
            if (!events.length) return { earned: false, progress: 0, total: 100 };
            let income = 0; let expenses = 0;
            events.forEach((e: any) => {
                if (e.type === 'income') income += e.predictedCost;
                else expenses += e.predictedCost;
            });
            let health = 100;
            if (expenses > 0) {
                const ratio = income / expenses;
                if (ratio >= 1.25) health = 100;
                else if (ratio >= 1) health = Math.round(50 + ((ratio - 1) / 0.25) * 50);
                else health = Math.round(ratio * 50);
            }
            const earned = health >= 80 && events.length >= 3;
            return { earned, progress: health, total: 100, detail: `Health: ${health}%` };
        },
    },
];

// ─────────────────────────────────────────────
//  TIER STYLES
// ─────────────────────────────────────────────
const tierStyle: Record<BadgeTier, { ring: string; glow: string; bg: string; text: string; label: string }> = {
    bronze: { ring: 'ring-amber-700/60', glow: 'shadow-[0_0_18px_rgba(180,83,9,0.4)]', bg: 'from-amber-950/60 to-amber-900/20', text: 'text-amber-500', label: 'BRONZE' },
    silver: { ring: 'ring-slate-400/50', glow: 'shadow-[0_0_18px_rgba(148,163,184,0.3)]', bg: 'from-slate-800/60 to-slate-700/20', text: 'text-slate-300', label: 'SILVER' },
    gold: { ring: 'ring-yellow-400/60', glow: 'shadow-[0_0_22px_rgba(250,204,21,0.35)]', bg: 'from-yellow-950/60 to-yellow-900/20', text: 'text-yellow-400', label: 'GOLD' },
    legendary: { ring: 'ring-violet-400/60', glow: 'shadow-[0_0_28px_rgba(167,139,250,0.45)]', bg: 'from-violet-950/60 to-fuchsia-900/20', text: 'text-violet-300', label: 'LEGENDARY' },
};

// ─────────────────────────────────────────────
//  BADGE CARD
// ─────────────────────────────────────────────
function BadgeCard({ def, earned, progress, total, detail }: { def: BadgeDef; earned: boolean; progress: number; total: number; detail?: string }) {
    const [flipped, setFlipped] = useState(false);
    const ts = tierStyle[def.tier];
    const pct = Math.round((progress / total) * 100);

    return (
        <div
            className={`relative cursor-pointer select-none transition-all duration-300 rounded-xl ring-1 ${ts.ring} ${earned ? ts.glow : ''} bg-gradient-to-br ${ts.bg} backdrop-blur-md overflow-hidden`}
            style={{ minHeight: 130 }}
            onClick={() => setFlipped(f => !f)}
        >
            {/* Scanline texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)' }} />

            {/* LOCKED overlay */}
            {!earned && (
                <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center z-10 rounded-xl">
                    <Lock className="w-5 h-5 text-slate-600 mb-1" />
                    <div className="w-3/4 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-gradient-to-r from-slate-600 to-slate-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 font-mono">{pct}%</span>
                </div>
            )}

            {/* FRONT */}
            {!flipped ? (
                <div className="p-3 flex flex-col gap-2 h-full">
                    <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg bg-slate-950/50 ring-1 ${ts.ring} ${ts.text}`}>
                            {def.icon}
                        </div>
                        <span className={`text-[9px] font-black tracking-[0.2em] ${ts.text} opacity-70`}>{ts.label}</span>
                    </div>
                    <div>
                        <p className={`text-sm font-black tracking-tight ${earned ? 'text-white' : 'text-slate-500'}`}>{def.name}</p>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{def.description}</p>
                    </div>
                    {earned && detail && (
                        <span className={`text-[10px] font-mono ${ts.text} bg-slate-950/40 px-1.5 py-0.5 rounded w-fit`}>{detail}</span>
                    )}
                    {earned && (
                        <div className="absolute top-2 right-2">
                            <span className="text-lg">✦</span>
                        </div>
                    )}
                </div>
            ) : (
                /* BACK — lore */
                <div className="p-3 flex flex-col justify-between h-full">
                    <p className={`text-[11px] italic leading-relaxed ${ts.text} opacity-90`}>{def.flavor}</p>
                    <span className="text-[10px] text-slate-600 mt-2">tap to flip back</span>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
//  TROPHY COUNTER PILL
// ─────────────────────────────────────────────
function TrophyPill({ count, total, onClick }: { count: number; total: number; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex my-5 items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 hover:border-yellow-500/40 transition-all shadow-lg hover:shadow-[0_0_16px_rgba(250,204,21,0.2)] group"
        >
            <Trophy className="w-3.5 h-3.5 text-yellow-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black text-white">{count}</span>
            <span className="text-[10px] text-slate-500">/{total} badges</span>
            <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
        </button>
    );
}

// ─────────────────────────────────────────────
//  MAIN EXPORT — Full Badge Panel (slide-in)
// ─────────────────────────────────────────────
export function BadgeSystem() {
    const { events, user } = useStore();
    const [open, setOpen] = useState(false);

    const results = useMemo(() =>
        BADGE_DEFS.map(def => ({ def, ...def.check(events, user) })),
        [events, user]
    );

    const earned = results.filter(r => r.earned);
    const locked = results.filter(r => !r.earned);

    return (
        <>
            {/* ── FLOATING TRIGGER ── */}
            <div className="fixed bottom-4 left-6 z-50">
                <TrophyPill count={earned.length} total={BADGE_DEFS.length} onClick={() => setOpen(true)} />
            </div>

            {/* ── SLIDE-IN PANEL ── */}
            <div className={`fixed inset-y-0 left-0 z-[60] w-[340px] flex flex-col bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <div>
                            <h2 className="text-white font-black tracking-tight text-sm">Achievement Ledger</h2>
                            <p className="text-[11px] text-slate-500">{earned.length} of {BADGE_DEFS.length} unlocked</p>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress bar */}
                < div className="px-5 py-3 border-b border-slate-800/50" >
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                        <span className="font-mono">OVERALL PROGRESS</span>
                        <span className="font-mono text-yellow-400">{Math.round((earned.length / BADGE_DEFS.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-300 transition-all duration-700"
                            style={{ width: `${(earned.length / BADGE_DEFS.length) * 100}%` }}
                        />
                    </div>
                </div >

                {/* Badge Grid */}
                < div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" >

                    {
                        earned.length > 0 && (
                            <div>
                                <p className="text-[10px] text-emerald-400 font-black tracking-[0.2em] uppercase mb-2">✦ Earned ({earned.length})</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {earned.map(r => (
                                        <BadgeCard key={r.def.id} def={r.def} earned={true} progress={r.progress} total={r.total} detail={r.detail} />
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    {
                        locked.length > 0 && (
                            <div>
                                <p className="text-[10px] text-slate-600 font-black tracking-[0.2em] uppercase mb-2">⌛ In Progress ({locked.length})</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {locked.map(r => (
                                        <BadgeCard key={r.def.id} def={r.def} earned={false} progress={r.progress} total={r.total} detail={r.detail} />
                                    ))}
                                </div>
                            </div>
                        )
                    }
                </div >

                {/* Footer hint */}
                < div className="px-5 py-3 border-t border-slate-800/50" >
                    <p className="text-[10px] text-slate-600 text-center italic">Tap any badge to flip and reveal its lore.</p>
                </div >
            </div >

            {/* Backdrop */}
            {
                open && (
                    <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
                )
            }
        </>
    );
}