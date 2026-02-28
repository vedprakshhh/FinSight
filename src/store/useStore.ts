import { create } from 'zustand';

interface User {
    name: string;
    baseBalance: number;
    safeToSpend: number;
}

interface CalendarEvent {
    id: number;
    title: string;
    date: Date;
    type: string;
    amount?: number;
    predictedCost: number;
    status: string;
}

interface StoreState {
    user: User;
    events: CalendarEvent[];
}

export const useStore = create<StoreState>((set) => ({
    user: {
        name: "Alex",
        baseBalance: 850.00,
        safeToSpend: 142.50, // baseBalance - predicted event costs
    },
    events: [
        {
            id: 1,
            title: "Payday",
            date: new Date(2026, 1, 28), // Today (Feb 28)
            type: "income",
            amount: 1200,
            predictedCost: 0,
            status: "safe"
        },
        {
            id: 2,
            title: "Study Group @ SFU Library",
            date: new Date(2026, 2, 1),
            type: "social",
            predictedCost: 5, // Just a coffee
            status: "safe"
        },
        {
            id: 3,
            title: "Amir's Birthday Dinner @ The Keg",
            date: new Date(2026, 2, 2), // March 2
            type: "social",
            predictedCost: 120, // High cost
            status: "danger" // This triggers the red UI
        }
    ],
    // We'll add functions here later to update events based on Gemini output
}));