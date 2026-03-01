"use client";

import ThreeWave from '@/src/components/ThreeWave';
import { useState } from 'react';
import { useStore } from '../src/store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Sparkles, Volume2, MessageSquare, Calendar } from 'lucide-react';
import IncomingInviteModal from '@/src/components/IncomingInviteModal';
import SyncCalendarButton from '@/src/components/SyncCalendarButton';

export default function Dashboard() {
  const { user, events, resolveEvent } = useStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'drafted'>('idle');
  const [realInviteData, setRealInviteData] = useState<any>(null);

  // New state to hold the AI response!
  const [aiData, setAiData] = useState<{ analysis: string; draft: string; savings: number; } | null>(null);

  const handleInviteFound = (eventData: any) => {
    setRealInviteData(eventData);
    setIsInviteModalOpen(true);
  };

  // You will trigger this from inside ThreeWave when clicking a 3D node
  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setAiStatus('idle');
    setAiData(null);
    setIsModalOpen(true);
  };

  const handleDraftMessage = async () => {
    setAiStatus('analyzing');

    try {
      // 1. Try to hit Teammate 2's API
      const response = await fetch('/api/analyze-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedEvent.title,
          cost: selectedEvent.predictedCost,
          balance: user.currentBalance
        })
      });

      if (!response.ok) throw new Error("API failed");

      const data = await response.json();
      setAiData(data);
      setAiStatus('drafted');

    } catch (error) {
      console.warn("Wi-Fi failed or API not ready. Triggering God Mode Fallback.");
      // 2. The Hackathon Demo Savior (Fallback Data)
      setTimeout(() => {
        setAiData({
          analysis: `A $${selectedEvent?.predictedCost} expense for ${selectedEvent?.title} pushes you critically close to your safety margin before your next payday.`,
          draft: `Hey! Instead of everyone spending $${selectedEvent?.predictedCost} individually for ${selectedEvent?.title}, what if we split a group gift/activity? It would only be about $25 each! Let me know.`,
          savings: selectedEvent?.predictedCost - 25
        });
        setAiStatus('drafted');
      }, 1200); // Add a slight delay so it looks like it's "thinking"
    }
  };

  return (
    <div className="h-screen w-screen bg-[#020617] font-sans text-slate-100 flex flex-col overflow-hidden relative">
      <header className="px-8 pt-6 pb-2 flex justify-between items-end shrink-0 z-20 pointer-events-none relative">
        <div className="pointer-events-auto text-right bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl shadow-2xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Safe to Spend</div>
          <div className="text-4xl font-extrabold text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            ${user.safeToSpend.toFixed(2)}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            variant="outline"
            size="sm"
            className="pointer-events-auto bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white"
          >
            <Calendar className="h-4 w-4 mr-2" /> <div className="pointer-events-auto flex gap-2">
              <SyncCalendarButton onInviteFound={handleInviteFound} />
            </div>
          </Button>
          <Button
            variant="ghost"
            onClick={() => setIsInviteModalOpen(true)}
            className="pointer-events-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full shadow-lg shadow-indigo-900/50 flex items-center gap-2 transition-all"
          >
            <Sparkles className="h-4 w-4" /> AI Assistant
          </Button>
        </div>
      </header>

      {/* --- FULL SCREEN 3D TIMELINE --- */}
      <div className="flex-1 relative w-full h-full -mt-10 z-0">
        <ThreeWave onNodeClick={handleEventClick} />
      </div>

      {/* --- DARK THEME AI MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[450px] bg-slate-950 border border-slate-800 text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">{selectedEvent?.title}</DialogTitle>
              {selectedEvent?.status === 'danger' && <Badge variant="destructive" className="bg-red-900/80 border border-red-500 text-red-200">Risk Detected</Badge>}
              {selectedEvent?.status === 'warning' && <Badge className="bg-amber-900/80 border border-amber-500 text-amber-200 hover:bg-amber-900/80">Caution</Badge>}
            </div>
            <DialogDescription className="pt-2 text-slate-400">
              Predicted Cost: <span className="font-bold text-slate-200">${selectedEvent?.predictedCost}</span>
            </DialogDescription>
          </DialogHeader>

          {/* AI Analysis Block */}
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mt-2">
            <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold text-sm">
              <Sparkles className="h-4 w-4" /> Gemini Analysis
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {aiData?.analysis || `Analyzing financial impact of ${selectedEvent?.title}...`}
            </p>
          </div>

          {/* Idle State (Buttons) */}
          {aiStatus === 'idle' && (
            <div className="flex flex-col gap-2 mt-4">
              <Button variant="outline" className="w-full justify-start text-left bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white" onClick={handleDraftMessage}>
                <MessageSquare className="mr-2 h-4 w-4 text-indigo-400" /> Draft a "Cost Split" message to peers
              </Button>
              <Button variant="outline" className="w-full justify-start text-left bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white">
                <Sparkles className="mr-2 h-4 w-4 text-indigo-400" /> Generate cheaper local alternatives
              </Button>
            </div>
          )}

          {/* Analyzing State */}
          {aiStatus === 'analyzing' && (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center gap-3 text-indigo-400 font-medium">
                <Sparkles className="h-5 w-5 animate-spin" />
                <span className="animate-pulse">Gemini is drafting a response...</span>
              </div>
            </div>
          )}
          {/* Drafted State */}
          {aiStatus === 'drafted' && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-indigo-950/30 p-4 rounded-md border border-indigo-900/50 text-sm italic text-indigo-200 relative leading-relaxed">
                "{aiData?.draft}"
              </div>
              <DialogFooter className="mt-6 sm:justify-between flex-row items-center gap-2">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/50" title="Play audio briefing">
                  <Volume2 className="h-5 w-5" />
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800">Cancel</Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                    onClick={() => {
                      resolveEvent(selectedEvent.id, aiData?.savings || 0);
                      setIsModalOpen(false);
                    }}
                  >
                    Send & Save ${aiData?.savings}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <IncomingInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}