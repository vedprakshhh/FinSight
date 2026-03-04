import { create } from 'zustand';

let eventIdCounter = 100;

const seedEvents = [
    {
        id: 'grocery-run',
        title: 'Grocery Run 🛒',
        start: new Date(2026, 1, 28),
        type: 'variable',
        predictedCost: 42,
        status: 'expected',
    },
    {
        id: 'amir-birthday',
        title: "Amir's Birthday Dinner 🎂",
        start: new Date(2026, 2, 1),
        type: 'variable',
        predictedCost: 70,
        status: 'warning',
    },
    {
        id: 'earls-dinner',
        title: 'Earls Dinner with Friends 🍷',
        start: new Date(2026, 2, 2),
        type: 'variable',
        predictedCost: 85,
        status: 'warning',
    },
    {
        id: 'payday',
        title: 'Payday 💰',
        start: new Date(2026, 2, 4),
        type: 'income',
        predictedCost: 1200,
        status: 'safe',
    },
    {
        id: 'april-rent',
        title: 'April Rent 🏠',
        start: new Date(2026, 2, 5),
        type: 'fixed',
        predictedCost: 850,
        status: 'danger',
    },
    {
        id: 'granville-night',
        title: 'Granville Night Out 🎉',
        start: new Date(2026, 2, 7),
        type: 'variable',
        predictedCost: 180,
        status: 'warning',
    },
];

interface User {
    name: string;
    currentBalance: number;
    safeToSpend: number;
}

interface AppEvent {
    id: string;
    title: string;
    start: Date;
    type: 'income' | 'fixed' | 'variable' | 'social';
    predictedCost: number;
    status: 'safe' | 'expected' | 'warning' | 'danger';
    resolved?: boolean;
}

interface StoreState {
    user: User;
    events: AppEvent[];
    isFractured: boolean;
    ghostEvents: AppEvent[];
    proposedEvents: any[];
    addEvent: (event: Omit<AppEvent, 'id'>) => void;
    updateEvent: (id: string, updates: Partial<AppEvent>) => void;
    removeEvent: (id: string) => void;
    clearAllEvents: () => void;
    resolveEvent: (id: string, savedAmount: number) => void;
    fractureTimeline: () => void;
    healTimeline: () => void;
    hydrateFromDatabase: (user: Partial<User>, events: any[]) => void;
}

export const useStore = create<StoreState>((set) => ({
    user: {
        name: 'Alex',
        currentBalance: 850,
        safeToSpend: 142.50,
    },
    events: seedEvents as AppEvent[],
    isFractured: false,
    ghostEvents: [],
    proposedEvents: [],

    addEvent: (event) =>
        set((state) => {
            const costDelta = event.type === 'income' ? event.predictedCost : -event.predictedCost;
            return {
                events: [
                    ...state.events,
                    { ...event, id: `event-${++eventIdCounter}` },
                ],
                user: {
                    ...state.user,
                    currentBalance: state.user.currentBalance + costDelta,
                    safeToSpend: state.user.safeToSpend + costDelta
                }
            };
        }),

    updateEvent: (id, updates) =>
        set((state) => {
            const oldEvent = state.events.find(e => e.id === id);
            if (!oldEvent) return state;

            let oldCostDelta = oldEvent.type === 'income' ? oldEvent.predictedCost : -oldEvent.predictedCost;
            let newType = updates.type !== undefined ? updates.type : oldEvent.type;
            let newCost = updates.predictedCost !== undefined ? updates.predictedCost : oldEvent.predictedCost;
            let newCostDelta = newType === 'income' ? newCost : -newCost;
            let diff = newCostDelta - oldCostDelta;

            return {
                events: state.events.map((e) =>
                    e.id === id ? { ...e, ...updates } : e
                ),
                user: {
                    ...state.user,
                    currentBalance: state.user.currentBalance + diff,
                    safeToSpend: state.user.safeToSpend + diff
                }
            };
        }),

    removeEvent: (id) =>
        set((state) => {
            const oldEvent = state.events.find(e => e.id === id);
            if (!oldEvent) return state;

            let oldCostDelta = oldEvent.type === 'income' ? oldEvent.predictedCost : -oldEvent.predictedCost;

            return {
                events: state.events.filter((e) => e.id !== id),
                user: {
                    ...state.user,
                    currentBalance: state.user.currentBalance - oldCostDelta,
                    safeToSpend: state.user.safeToSpend - oldCostDelta
                }
            };
        }),

    clearAllEvents: () => set({ events: [] }),

    resolveEvent: (id, savedAmount) =>
        set((state) => ({
            events: state.events.map((e) =>
                e.id === id ? { ...e, status: 'safe' as const, resolved: true } : e
            ),
            user: {
                ...state.user,
                currentBalance: state.user.currentBalance + savedAmount,
                safeToSpend: state.user.safeToSpend + savedAmount,
            },
        })),

    fractureTimeline: () =>
        set((state) => {
            const emergencyEvent = {
                id: 'fracture-car-tow',
                title: '🚗 Emergency Car Tow',
                start: new Date(2026, 1, 28, 12, 0), // noon today
                type: 'variable' as const,
                predictedCost: 300,
                status: 'danger' as const,
            };

            // The Golden Path: What the AI suggests to save the timeline
            const healedEvents = state.events
                .filter((e) => e.id !== 'granville-night') // Cancelled
                .map((e) => e.id === 'earls-dinner'
                    ? { ...e, title: 'Coffee Meetup ☕', predictedCost: 15, status: 'safe' as const }
                    : e);

            const proposed = [
                ...healedEvents,
                emergencyEvent, // The tow still happens!
                { id: 'cineplex-tuesday', title: '🎬 Cineplex Movie Night', start: new Date(2026, 2, 3), type: 'variable' as const, predictedCost: 15, status: 'safe' as const },
                { id: 'soccer-dropin', title: '⚽ Local Drop-in Soccer', start: new Date(2026, 2, 4), type: 'variable' as const, predictedCost: 10, status: 'safe' as const },
            ];

            return {
                isFractured: true,
                ghostEvents: [...state.events],
                events: [...state.events, emergencyEvent],
                proposedEvents: proposed,
                user: { ...state.user, currentBalance: state.user.currentBalance - 300, safeToSpend: state.user.safeToSpend - 300 },
            };
        }),

    healTimeline: () =>
        set((state) => ({
            isFractured: false,
            ghostEvents: [],
            events: state.proposedEvents, // Just adopt the golden path
            proposedEvents: [],
            user: { ...state.user, currentBalance: state.user.currentBalance + 225, safeToSpend: state.user.safeToSpend + 225 },
        })),

    hydrateFromDatabase: (userData, newEvents) =>
        set((state) => ({
            user: { ...state.user, ...userData },
            events: newEvents as AppEvent[],
        })),
}));
