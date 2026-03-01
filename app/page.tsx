"use client";

import ThreeWave from '@/src/components/ThreeWave';
import { useState } from 'react';
import { useStore } from '../src/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { Sparkles, Volume2, MessageSquare, MapPin } from 'lucide-react';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function Dashboard() {
  const { user, events, resolveEvent } = useStore();

  // --- NEW: Modal & AI State ---
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'drafted'>('idle');

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setAiStatus('idle');
    setIsModalOpen(true);
  };

  const handleDraftMessage = () => {
    setAiStatus('analyzing');
    // Fake the AI delay for the demo
    setTimeout(() => setAiStatus('drafted'), 1500);
  };
  // -----------------------------

  const chartData = [
    { date: 'Feb 28', balance: 850 },
    { date: 'Mar 1', balance: 845 },
    { date: 'Mar 2', balance: 725 },
    { date: 'Mar 3', balance: 725 },
    { date: 'Mar 4', balance: 700 },
  ];

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#10b981';
    if (event.status === 'danger') backgroundColor = '#ef4444';
    return { style: { backgroundColor, borderRadius: '6px', color: 'white', border: 'none' } };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">FutureSpend</h1>
        <p className="text-slate-500">Welcome back, {user.name}. Here is your financial forecast.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 border-l-4 border-l-indigo-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Safe to Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-900">${user.safeToSpend.toFixed(2)}</div>
            <p className="text-xs text-slate-400 mt-1">After predicted calendar expenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>14-Day Trajectory</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Calendar Intersections</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%', fontFamily: 'inherit' }}
              views={['month', 'week', 'day']}
              defaultView="week"
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleEventClick} // <-- NEW TRIGGER HERE
            />
          </CardContent>
        </Card>
      </div>

      {/* --- NEW: The AI Action Modal --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{selectedEvent?.title}</DialogTitle>
              {selectedEvent?.status === 'danger' && <Badge variant="destructive">Budget Risk</Badge>}
            </div>
            <DialogDescription className="pt-2">
              Predicted Cost: <span className="font-bold text-slate-900">${selectedEvent?.predictedCost}</span>
              <span className="text-xs text-slate-500 block mt-1">(Estimated $50 dinner + $70 individual gift)</span>
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-2">
            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-semibold">
              <Sparkles className="h-4 w-4" />
              Gemini Analysis
            </div>
            <p className="text-sm text-slate-600">
              A $70 individual gift pushes you <span className="font-bold text-red-500">$20.00 over</span> your safe-to-spend limit before payday.
            </p>
          </div>

          {aiStatus === 'idle' && (
            <div className="flex flex-col gap-2 mt-4">
              <Button variant="outline" className="w-full justify-start text-left" onClick={handleDraftMessage}>
                <MessageSquare className="mr-2 h-4 w-4 text-indigo-500" /> Draft a "Group Gift Split" message to friends
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                <Sparkles className="mr-2 h-4 w-4 text-indigo-500" /> Generate thoughtful gift ideas under $20
              </Button>
            </div>
          )}

          {aiStatus === 'analyzing' && (
            <div className="flex justify-center items-center py-6">
              <div className="animate-pulse flex items-center gap-2 text-indigo-500 font-medium">
                <Sparkles className="h-5 w-5 animate-spin" /> Drafting group message...
              </div>
            </div>
          )}

          {aiStatus === 'drafted' && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100 text-sm italic text-slate-700 relative">
                "Hey guys! For Amir's birthday tonight, I was thinking instead of us all buying smaller separate things, we could split the cost of that mechanical keyboard he's been wanting? If we split it 4 ways, it's only $25 each! Let me know what you think."
              </div>
              <DialogFooter className="mt-4 sm:justify-between flex-row items-center gap-2">
                <Button variant="ghost" size="icon" className="text-slate-500 hover:text-indigo-600" title="Play audio briefing">
                  <Volume2 className="h-5 w-5" />
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  {/* The button updates to show the savings! */}
                  {/* --- NEW: The Trigger --- */}
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      // Save $45 ($70 individual gift - $25 group split)
                      resolveEvent(selectedEvent.id, 45); 
                      setIsModalOpen(false); // Close the modal
                    }}
                  >
                    Send & Save $45
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Card className="shadow-sm border-0 bg-slate-950 text-white">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-slate-100">Sacred Timeline</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] p-0">
             {/* The 3D Magic happens here */}
             <ThreeWave />
          </CardContent>
        </Card>
    </div>
  );
}