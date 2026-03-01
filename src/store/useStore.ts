import { create } from 'zustand';

export const useStore = create((set) => ({
  user: {
    name: "Alex",
    baseBalance: 850.00,
    safeToSpend: 142.50,
  },
  events: [
    {
      id: 1,
      title: "Payday",
      start: new Date(2026, 1, 28, 9, 0), 
      end: new Date(2026, 1, 28, 10, 0),
      type: "income",
      amount: 1200,
      predictedCost: 0,
      status: "safe"
    },
    {
      id: 2,
      title: "Study Group @ SFU Library",
      start: new Date(2026, 2, 1, 14, 0), 
      end: new Date(2026, 2, 1, 16, 0),
      type: "social",
      predictedCost: 5,
      status: "safe"
    },
    {
      id: 3,
      title: "Amir's Birthday (Dinner + Gift)",
      start: new Date(2026, 1, 28, 19, 0), 
      end: new Date(2026, 1, 28, 22, 0),
      type: "social",
      predictedCost: 120, // $50 dinner + $70 individual gift
      status: "danger"
    }
  ],
  
  // --- NEW: The AI Resolution Action ---
  resolveEvent: (eventId: number, savedAmount: number) => set((state: any) => ({
    events: state.events.map((e: any) => 
      e.id === eventId ? { ...e, status: 'safe', predictedCost: e.predictedCost - savedAmount } : e
    ),
    user: { 
      ...state.user, 
      safeToSpend: state.user.safeToSpend + savedAmount // Give them the $45 back!
    }
  }))
}));