"use client";

import { useState } from 'react';
import { Button } from "@/src/ui/button";
import { Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function SyncCalendarButton({ onInviteFound }: { onInviteFound: (eventData: any) => void }) {
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle');

    const loginAndFetch = useGoogleLogin({
        // Request strictly read-only access to their calendar
        scope: 'https://www.googleapis.com/auth/calendar.readonly',

        onSuccess: async (tokenResponse) => {
            setSyncStatus('syncing');
            try {
                // Fetch the next 10 upcoming events from the user's primary calendar
                const timeMin = new Date().toISOString();
                const response = await fetch(
                    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&singleEvents=true&orderBy=startTime`,
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );

                if (!response.ok) throw new Error("Google API rejected the request.");

                const data = await response.json();
                const events = data.items || [];

                // Hackathon Magic: Look for a real event where the user hasn't RSVP'd yet ('needsAction')
                // If none exist, we just grab the first upcoming event so your demo still works perfectly!
                const pendingEvent = events.find((e: any) =>
                    e.attendees && e.attendees.some((a: any) => a.self && a.responseStatus === 'needsAction')
                ) || events[0];

                if (pendingEvent) {
                    // Pass the REAL Google Calendar data up to your modal
                    onInviteFound({
                        title: pendingEvent.summary || "Untitled Event",
                        sender: pendingEvent.creator?.email || "Calendar Inviter",
                        time: new Date(pendingEvent.start?.dateTime || pendingEvent.start?.date).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        predictedCost: 0 // We will let Gemini calculate this!
                    });
                } else {
                    // THE BULLETPROOF FALLBACK: If calendar is empty, use this perfect demo data!
                    console.warn("Calendar empty. Using fallback demo event.");
                    onInviteFound({
                        title: "Earls Patio Drinks",
                        sender: "sarah.jenkins@example.com",
                        time: "Tomorrow, 7:00 PM",
                        predictedCost: 0 // We will let Gemini calculate this!
                    });
                }

                setSyncStatus('done');
                setTimeout(() => setSyncStatus('idle'), 3000);
            } catch (error) {
                console.error("Fetch error:", error);
                setSyncStatus('idle');
                alert("Failed to pull from Google Calendar. Check console.");
            }
        },
        onError: (error) => {
            console.error('OAuth Login Failed:', error);
            setSyncStatus('idle');
        }
    });

    return (
        <Button
            onClick={() => loginAndFetch()}
            disabled={syncStatus === 'syncing'}
            variant="outline"
            size="sm"
            className="pointer-events-auto bg-slate-900/50 border-slate-700 text-slate-400 hover:text-white transition-all"
        >
            {syncStatus === 'syncing' ? <Loader2 className="h-4 w-4 mr-2 animate-spin text-indigo-400" /> :
                syncStatus === 'done' ? <CheckCircle2 className="h-4 w-4 mr-2 text-indigo-400" /> :
                    <Calendar className="h-4 w-4 mr-2 text-indigo-400" />}

            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync G-Cal'}
        </Button>
    );
}