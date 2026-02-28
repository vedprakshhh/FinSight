"use client";

import { useStore } from '../src/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';

// CRUCIAL: You must import this CSS or the calendar will look like a broken text file
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the calendar date logic
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function Dashboard() {
  // Pulling data from your Zustand store
  const { user, events } = useStore();

  // Quick mocked data for the chart (we will make this dynamic from your store later)
  const chartData = [
    { date: 'Feb 28', balance: 850 }, // Payday
    { date: 'Mar 1', balance: 845 },  // Coffee study group
    { date: 'Mar 2', balance: 725 },  // The dangerous Steakhouse dinner!
    { date: 'Mar 3', balance: 725 },
    { date: 'Mar 4', balance: 700 },
  ];

  // Function to color-code calendar events based on danger level
  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#10b981'; // Green for safe
    if (event.status === 'danger') backgroundColor = '#ef4444'; // Red for danger
    return { style: { backgroundColor, borderRadius: '6px', color: 'white', border: 'none' } };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">

      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">FutureSpend</h1>
        <p className="text-slate-500">Welcome back, {user.name}. Here is your financial forecast.</p>
      </header>

      {/* Hero Number */}
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

      {/* Main Grid: Chart & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Column: 2D Timeline Chart */}
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
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right Column: Smart Calendar */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Calendar Intersections</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="date"
              endAccessor="date"
              style={{ height: '100%', fontFamily: 'inherit' }}
              views={['month', 'week']}
              defaultView="week"
              eventPropGetter={eventStyleGetter}
            // We will add the onClick handler for the Action Modal here next!
            />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}