"use client";

import ThreeWave from '@/src/components/ThreeWave';
import { useState, useRef } from 'react';
import { useStore } from '@/src/store/useStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/ui/dialog";
import { Button } from "@/src/ui/button";
import { Badge } from "@/src/ui/badge";
import { Sparkles, Volume2, Zap, Loader2 } from 'lucide-react';
import IncomingInviteModal from '@/src/components/IncomingInviteModal';
import SyncCalendarButton from '@/src/components/SyncCalendarButton';

export default function Dashboard() {
  const {
    user,
    events,
    resolveEvent,
    isFractured,
    fractureTimeline,
    healTimeline,
  } = useStore();

  // Event click modal
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'drafted'>('idle');
  const [aiData, setAiData] = useState<{
    analysis: string;
    draft: string;
    savings: number;
  } | null>(null);

  // Invite modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [realInviteData, setRealInviteData] = useState<any>(null);

  // Rebalancer modal
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);
  const [fractureStage, setFractureStage] = useState<'idle' | 'impact' | 'calculating' | 'rebalance'>('idle');

  const handleInviteFound = (eventData: any) => {
    setRealInviteData(eventData);
    setIsInviteModalOpen(true);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setAiStatus('idle');
    setAiData(null);
    setIsModalOpen(true);
  };

  const triggerEmergencySequence = async () => {
    if (fractureStage !== 'idle') return;

    // 1. THE IMPACT ($300 Tow drops the line)
    fractureTimeline();
    setFractureStage('impact');

    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: "Critical Alert. A $300 emergency auto expense has breached your April Rent safety margin.", mode: "urgent" })
      });
      const audioUrl = URL.createObjectURL(await res.blob());
      new Audio(audioUrl).play();
    } catch (e) { console.error("Audio failed"); }

    // 2. THE AI CALCULATES (Draw the golden dashed line)
    setTimeout(async () => {
      setFractureStage('calculating');

      try {
        const res2 = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: "Calculating optimized recovery path. Bypassing Granville Night Out. Rerouting to safe balance.", mode: "neutral" })
        });
        const audioUrl2 = URL.createObjectURL(await res2.blob());
        new Audio(audioUrl2).play();
      } catch (e) { }

      // 3. SHOW THE FIX (Slide up the Rebalance Modal)
      setTimeout(() => {
        setFractureStage('rebalance');
      }, 4000); // Let them stare at the golden path for 4 seconds

    }, 5000); // 5 seconds of red panic before AI kicks in
  };

  const handleDraftMessage = async () => {
    setAiStatus('analyzing');
    try {
      const response = await fetch('/api/analyze-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedEvent.title,
          cost: selectedEvent.predictedCost,
          balance: user.currentBalance,
        }),
      });
      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      setAiData(data);
      setAiStatus('drafted');
    } catch {
      // Fallback — demo never breaks
      setTimeout(() => {
        setAiData({
          analysis: `A $${selectedEvent?.predictedCost} expense for "${selectedEvent?.title}" pushes you critically close to your safety margin before your next payday.`,
          draft: `Hey! Instead of everyone spending $${selectedEvent?.predictedCost} individually for ${selectedEvent?.title}, what if we split a group gift? It would only be about $25 each! Let me know. 😊`,
          savings: (selectedEvent?.predictedCost ?? 50) - 25,
        });
        setAiStatus('drafted');
      }, 1200);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden flex flex-col">

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-lg tracking-tight">FutureSpend</span>
          <span className="text-slate-600 text-xs">by Team FutureSpend</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-slate-500 text-xs">Safe to Spend</p>
            <p className={`font-black text-xl ${user.safeToSpend < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              ${user.safeToSpend.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-500 text-xs">Balance</p>
            <p className="text-white font-bold text-lg">${user.currentBalance.toFixed(2)}</p>
          </div>

          <SyncCalendarButton onInviteFound={handleInviteFound} />

          {/* God Mode — tiny, hidden in plain sight */}
          <button onClick={triggerEmergencySequence} className="p-1.5 text-slate-700 hover:text-red-500 transition-colors rounded">
            <Zap className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full Screen 3D Timeline */}
      <div className="flex-1 min-h-0 p-4">
        <ThreeWave showGoldenPath={fractureStage === 'calculating' || fractureStage === 'rebalance'} onNodeClick={handleEventClick} />
      </div>

      {/* ========== GOLDEN REBALANCE BUTTON ========== */}
      {fractureStage === 'calculating' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-slate-900 border border-amber-500/50 rounded-full text-amber-400 font-bold animate-pulse shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          ✨ AI is generating an optimized recovery path...
        </div>
      )}

      {/* ========== REBALANCE MODAL ========== */}
      {fractureStage === 'rebalance' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-[700px] mx-4 bg-slate-900 border border-amber-700/40 rounded-2xl shadow-[0_0_80px_rgba(245,158,11,0.15)] overflow-hidden">

            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚖️</span>
                <div>
                  <h2 className="text-white font-black text-xl">AI Timeline Rebalancer</h2>
                  <p className="text-slate-400 text-sm">
                    Re-routing funds to protect your fixed expenses and mental health.
                  </p>
                </div>
              </div>
              <div className="mt-4 px-4 py-3 bg-red-950/40 border border-red-800/50 rounded-xl text-sm flex items-center gap-3">
                <span className="text-red-400 font-bold">⚠️ Emergency Car Tow: -$300</span>
                <span className="text-slate-400">Your timeline dropped into the danger zone.</span>
              </div>
            </div>

            {/* Split Pane */}
            <div className="grid grid-cols-2 gap-4 p-6">

              {/* LEFT — Sacrifices */}
              <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4">
                <p className="text-red-400 font-bold text-sm mb-4">❌ The Sacrifices</p>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="line-through text-slate-500">Granville Night Out ($180)</span>
                    <span className="ml-2 text-red-400 font-semibold">→ Canceled</span>
                  </div>
                  <div>
                    <span className="line-through text-slate-500">Earls Dinner ($85)</span>
                    <span className="ml-2 text-amber-400 font-semibold">→ Coffee Meetup ($15)</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-red-900/40 text-emerald-400 font-bold text-sm">
                  Total Recovered: +$250
                </div>
              </div>

              {/* RIGHT — Mental Health Reinvestment */}
              <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4">
                <p className="text-emerald-400 font-bold text-sm mb-4">✨ Mental Health Reinvestment</p>
                <div className="space-y-3 text-sm">
                  <div className="text-emerald-300">✨ Added: Cineplex Movie Night ($15)</div>
                  <div className="text-emerald-300">⚽ Added: Local Drop-in Soccer ($10)</div>
                </div>
                <p className="mt-3 text-slate-500 text-xs italic leading-relaxed">
                  Budgeting shouldn't mean isolation. We've re-allocated $25 for low-cost social activities.
                </p>
                <div className="mt-4 pt-3 border-t border-emerald-900/40 text-slate-400 text-sm">
                  Reinvested: -$25
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800">
              <p className="text-slate-300 text-sm mb-4">
                <span className="text-emerald-400 font-bold">Net Impact: +$225 saved.</span>
                {' '}April Rent is now safe. You still get a movie night. 🎬
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setFractureStage('idle')}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm font-semibold"
                >
                  Reject Plan
                </button>
                <button
                  onClick={() => {
                    healTimeline();
                    setFractureStage('idle');
                  }}
                  className="flex-[2] py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_45px_rgba(16,185,129,0.55)]"
                >
                  ✅ Accept & Heal Timeline
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========== EVENT CLICK MODAL ========== */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent?.title}
              {selectedEvent?.status === 'danger' && (
                <Badge variant="destructive">Budget Risk</Badge>
              )}
              {selectedEvent?.status === 'warning' && (
                <Badge className="bg-amber-900 text-amber-300">Caution</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-slate-400 text-sm">
              Predicted Cost:{' '}
              <span className="text-white font-bold">${selectedEvent?.predictedCost}</span>
            </p>

            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold">Gemini Analysis</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {aiData?.analysis ||
                  `Analyzing the financial impact of "${selectedEvent?.title}"...`}
              </p>
            </div>

            {aiStatus === 'idle' && (
              <div className="space-y-2">
                <Button
                  onClick={handleDraftMessage}
                  className="w-full bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-400 border border-emerald-700/50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Draft a "Cost Split" message to peers
                </Button>
              </div>
            )}

            {aiStatus === 'analyzing' && (
              <div className="flex items-center gap-3 text-slate-400 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                Gemini is drafting a response...
              </div>
            )}

            {aiStatus === 'drafted' && aiData && (
              <div className="space-y-4">
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-600 text-slate-300 text-sm italic leading-relaxed">
                  "{aiData.draft}"
                </div>
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      resolveEvent(selectedEvent.id, aiData.savings);
                      setIsModalOpen(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    Send & Save ${aiData.savings}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ========== INCOMING INVITE MODAL ========== */}
      <IncomingInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
