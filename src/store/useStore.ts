import { create } from 'zustand';

export interface StoreState {
    user: {
        name: string;
        currentBalance: number;
        safeToSpend: number;
    };
    events: any[];
    addEvent: (newEvent: any) => void;
    removeEvent: (eventId: string) => void;
    clearAllEvents: () => void;
    resolveEvent: (eventId: string, savedAmount: number) => void;
}

export const useStore = create<StoreState>((set) => ({
    user: {
        name: "Alex",
        currentBalance: 850.00,
        safeToSpend: 142.50,
    },
    events: [
        {
            id: "1",
            title: "Amir's Birthday (Dinner + Gift)",
            start: new Date(2026, 1, 28, 19, 0),
            end: new Date(2026, 1, 28, 22, 0),
            type: "variable",
            predictedCost: 120,
            status: "danger"
        },
        {
            id: "2",
            title: "March Rent",
            start: new Date(2026, 2, 1, 9, 0),
            end: new Date(2026, 2, 1, 9, 5),
            type: "fixed",
            predictedCost: 1100,
            status: "expected"
        },
        {
            id: "3",
            title: "Payday (SFU TA Ship)",
            start: new Date(2026, 2, 12, 9, 0),
            end: new Date(2026, 2, 12, 9, 5),
            type: "income",
            predictedCost: 1150,
            status: "safe"
        },
{
  id: "4",
  title: "BC Hydro",
  start: new Date(2026, 2, 3, 12, 0),
  end: new Date(2026, 2, 3, 12, 5),
  type: "bill",
  predictedCost: 58,
  status: "safe"
},
{
  id: "5",
  title: "Save-On-Foods",
  start: new Date(2026, 2, 4, 18, 30),
  end: new Date(2026, 2, 4, 19, 30),
  type: "essential",
  predictedCost: 112,
  status: "safe"
},
{
  id: "6",
  title: "Payday (SFU TA Ship)",
  start: new Date(2026, 2, 12, 9, 0),
  end: new Date(2026, 2, 12, 9, 5),
  type: "income",
  predictedCost: 1150,
  status: "safe"
},
{
  id: "7",
  title: "Cypress Ski Day",
  start: new Date(2026, 2, 14, 7, 0),
  end: new Date(2026, 2, 14, 17, 0),
  type: "social",
  predictedCost: 145,
  status: "warning"
},
{
  id: "8",
  title: "Phone Bill (Fido)",
  start: new Date(2026, 2, 18, 10, 0),
  end: new Date(2026, 2, 18, 10, 5),
  type: "bill",
  predictedCost: 65,
  status: "safe"
},
{
  id: "9",
  title: "Payday (SFU TA Ship)",
  start: new Date(2026, 2, 26, 9, 0),
  end: new Date(2026, 2, 26, 9, 5),
  type: "income",
  predictedCost: 1150,
  status: "safe"
},
{
  id: "10",
  title: "Granville Night Out",
  start: new Date(2026, 2, 27, 21, 0),
  end: new Date(2026, 2, 28, 1, 30),
  type: "social",
  predictedCost: 180,
  status: "danger"
},{
  id:  "11",
  title: "April Rent",
  start: new Date(2026, 3, 1, 0, 5),
  end: new Date(2026, 3, 1, 0, 10),
  type: "fixed",
  predictedCost: 1950,
  status: "expected"
},
{
  id: "12",
  title: "Internet (Shaw)",
  start: new Date(2026, 3, 2, 9, 0),
  end: new Date(2026, 3, 2, 9, 5),
  type: "bill",
  predictedCost: 85,
  status: "safe"
},
{
  id: "13",
  title: "Costco Run",
  start: new Date(2026, 3, 5, 16, 0),
  end: new Date(2026, 3, 5, 17, 30),
  type: "essential",
  predictedCost: 138,
  status: "safe"
},
{
  id: "14",
  title: "Payday (SFU TA Ship)",
  start: new Date(2026, 3, 9, 9, 0),
  end: new Date(2026, 3, 9, 9, 5),
  type: "income",
  predictedCost: 1150,
  status: "safe"
},
{
  id: "15",
  title: "Coachella Livestream Party Supplies",
  start: new Date(2026, 3, 17, 18, 0),
  end: new Date(2026, 3, 17, 19, 0),
  type: "social",
  predictedCost: 95,
  status: "warning"
},
{
  id: "16",
  title: "Payday (SFU TA Ship)",
  start: new Date(2026, 3, 23, 9, 0),
  end: new Date(2026, 3, 23, 9, 5),
  type: "income",
  predictedCost: 1150,
  status: "safe"
},
{
  id: "17",
  title: "May Rent",
  start: new Date(2026, 4, 1, 0, 5),
  end: new Date(2026, 4, 1, 0, 10),
  type: "fixed",
  predictedCost: 1950,
  status: "expected"
},
{
  id: "18",
  title: "Victoria Weekend Trip (Ferry + Stay)",
  start: new Date(2026, 4, 15, 8, 0),
  end: new Date(2026, 4, 17, 20, 0),
  type: "social",
  predictedCost: 420,
  status: "danger"
},
{
  id: "19",
  title: "Payday (SFU TA Ship)",
  start: new Date(2026, 4, 21, 9, 0),
  end: new Date(2026, 4, 21, 9, 5),
  type: "income",
  predictedCost: 1150,
  status: "safe"
}
    ],

    // --- NEW CRUD ACTIONS FOR YOUR UI ---
    addEvent: (newEvent: any) => set((state: any) => ({
        events: [...state.events, { ...newEvent, id: Math.random().toString(36).substr(2, 9) }]
    })),

    removeEvent: (eventId: string) => set((state: any) => ({
        events: state.events.filter((e: any) => e.id !== eventId)
    })),

    clearAllEvents: () => set({ events: [] }),

    resolveEvent: (eventId: string, savedAmount: number) => set((state: any) => ({
        events: state.events.map((e: any) =>
            e.id === eventId ? { ...e, status: 'safe', predictedCost: e.predictedCost - savedAmount } : e
        ),
        user: { ...state.user, safeToSpend: state.user.safeToSpend + savedAmount }
    }))
}));