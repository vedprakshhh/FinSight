"use client";
import { useState, useRef } from 'react';
import { Mic, Loader2, Check, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, useDragControls } from 'framer-motion';

export function VoiceBot() {
    const [status, setStatus] = useState<'idle' | 'listening' | 'confirming' | 'processing' | 'success'>('idle');
    const [transcript, setTranscript] = useState("");
    const { addEvent } = useStore();
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const dragControls = useDragControls();

    const startRecording = async () => {
        setStatus('listening');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('file', blob, 'command.wav');
            formData.append('model_id', 'scribe_v2');

            try {
                // ElevenLabs Scribe v2 transcription
                const transRes = await fetch('/api/transcribe', { method: 'POST', body: formData });
                const { text } = await transRes.json();
                setTranscript(text);
                setStatus('confirming'); // Show the confirmation bubble
            } catch (err) {
                setStatus('idle');
            }
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 4000);
    };

    const confirmTransaction = async () => {
        setStatus('processing');
        try {
            const intentRes = await fetch('/api/process-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: transcript })
            });
            const { type, amount, title } = await intentRes.json();

            addEvent({
                title: `${title} 🎙️`,
                start: new Date(),
                type: type,
                predictedCost: amount,
                status: type === 'income' ? 'safe' : 'warning'
            });

            setStatus('success');
            setTimeout(() => { setStatus('idle'); setTranscript(""); }, 2000);
        } catch (err) {
            setStatus('idle');
        }
    };

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragMomentum={false}
            whileDrag={{ scale: 1.05, cursor: "grabbing" }}
            className="fixed bottom-4 right-4 z-[999] flex flex-col items-end gap-4 cursor-grab"
            style={{ touchAction: "none" }}
        >
            {/* Confirmation Bubble */}
            {status === 'confirming' && (
                <div
                    className="bg-slate-900 border border-indigo-500/50 p-4 rounded-2xl shadow-2xl w-64 animate-in slide-in-from-bottom-4 pointer-events-auto"
                    onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when typing
                >
                    <p className="text-xs text-indigo-400 font-bold uppercase mb-2">I heard:</p>
                    <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-white outline-none focus:border-indigo-500 transition-colors resize-none h-20"
                    />
                    <div className="flex gap-2 mt-3">
                        <button onClick={() => setStatus('idle')} className="flex-1 py-2 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-lg text-xs font-bold transition-all">
                            Cancel
                        </button>
                        <button onClick={confirmTransaction} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                            <Send size={14} /> Confirm
                        </button>
                    </div>
                </div>
            )}

            {/* Main Toggle Button */}
            <button
                onPointerDown={(e) => {
                    // Only click if we didn't drag
                    if (status === 'idle') startRecording();
                }}
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] pointer-events-auto ${status === 'listening' ? 'bg-red-600 border-red-400 animate-pulse' :
                        status === 'processing' ? 'bg-slate-800 border-indigo-500 animate-spin' :
                            'bg-slate-900 border-slate-700 hover:border-indigo-500 hover:bg-slate-800'
                    }`}
            >
                {status === 'listening' ? <Mic className="text-white" /> :
                    status === 'processing' ? <Loader2 className="text-indigo-400" /> :
                        status === 'success' ? <Check className="text-emerald-400" /> :
                            <Mic className="text-slate-400" />}
            </button>
        </motion.div>
    );
}