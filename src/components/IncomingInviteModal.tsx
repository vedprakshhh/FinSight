"use client";

import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/ui/dialog";
import { Button } from "@/src/ui/button";
import { Sparkles, Volume2, Calendar, Check, X, MessageSquare, Loader2 } from 'lucide-react';

export default function IncomingInviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user, addEvent } = useStore();
    const [audioStatus, setAudioStatus] = useState<'idle' | 'loading' | 'playing'>('idle');

    // MOCK GOOGLE CALENDAR DATA (What you fetched from your OAuth connection)
    const pendingInvite = {
        title: "Earls Patio Drinks",
        sender: "Sarah Jenkins",
        time: "Tomorrow, 7:00 PM",
        predictedCost: 85, // Extracted by Gemini based on "Earls"
    };

    // MOCK GEMINI ANALYSIS
    const aiAdvice = `Accepting this invite costs $${pendingInvite.predictedCost}, which drops your Safe-to-Spend balance from $${user.safeToSpend} down to $${user.safeToSpend - pendingInvite.predictedCost}. This puts you at risk before your April Rent. I suggest a counter-offer for coffee instead.`;

    // --- ELEVENLABS API INTEGRATION ---
    const handlePlayAudio = async () => {
        if (audioStatus === 'playing') return;
        setAudioStatus('loading');

        try {
            // Route through our Next.js API to securely use .env.local variables
            const response = await fetch(`/api/speak`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: aiAdvice
                })
            });

            if (!response.ok) throw new Error("ElevenLabs API failed");

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            audio.onended = () => setAudioStatus('idle');
            audio.play();
            setAudioStatus('playing');

        } catch (error) {
            console.error(error);
            setAudioStatus('idle');
            alert("Audio failed. Check your ElevenLabs API key!");
        }
    };

    const handleAccept = () => {
        // 1. Add to your 3D timeline
        addEvent({
            title: pendingInvite.title,
            start: new Date(2026, 2, 2), // Tomorrow mock date
            type: 'social',
            predictedCost: pendingInvite.predictedCost,
            status: 'warning'
        });
        // 2. Close modal
        onClose();
    };

    const handleCounterOffer = () => {
        // Hackathon smoke & mirrors: Copy to clipboard!
        navigator.clipboard.writeText(`Hey ${pendingInvite.sender}! I'm trying to save up this week. Want to grab coffee at JJ Bean instead?`);
        alert("Counter-offer copied to clipboard!");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-slate-950 border border-slate-800 text-slate-100 shadow-[0_0_50px_rgba(0,0,0,0.6)]">

                {/* Header (Looks like a Calendar Invite) */}
                <DialogHeader className="border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3 text-indigo-400 mb-2">
                        <Calendar className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">New Calendar Invite</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-white">{pendingInvite.title}</DialogTitle>
                    <DialogDescription className="text-slate-400 mt-1">
                        From: <span className="text-slate-200">{pendingInvite.sender}</span> • {pendingInvite.time}
                    </DialogDescription>
                </DialogHeader>

                {/* Gemini Financial Bouncer Analysis */}
                <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-900/50 mt-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl"></div>

                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                            <Sparkles className="h-4 w-4" /> FinSight AI Analysis
                        </div>

                        {/* ELEVENLABS BUTTON */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handlePlayAudio}
                            className="h-8 px-2 text-indigo-300 hover:text-white hover:bg-indigo-900/50 transition-all border border-indigo-500/30"
                        >
                            {audioStatus === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> :
                                audioStatus === 'playing' ? <Volume2 className="h-4 w-4 animate-pulse text-emerald-400" /> :
                                    <><Volume2 className="h-4 w-4 mr-2" /> Play Advice</>}
                        </Button>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{aiAdvice}"
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-6">
                    <Button
                        onClick={handleCounterOffer}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
                    >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Smart Counter-Offer (Save ~$75)
                    </Button>

                    <div className="flex gap-3">
                        <Button onClick={onClose} variant="outline" className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-red-400">
                            <X className="mr-2 h-4 w-4" /> Decline
                        </Button>
                        <Button onClick={handleAccept} variant="outline" className="flex-1 bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-amber-400">
                            <Check className="mr-2 h-4 w-4" /> Accept (-${pendingInvite.predictedCost})
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}