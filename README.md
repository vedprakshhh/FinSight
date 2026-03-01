# FinSight 🔮

FinSight is an advanced, AI-powered financial dashboard that visualizes your money not just as numbers, but as a living, breathing timeline. It anticipates expenses, visualizes budget health in 3D space, and uses generative AI to instantly re-route your spending when life throws a curveball.

## 🚀 Key Functionalities

### 1. 3D Financial Timeline (`ThreeWave`)
Your budget is visualized as a glowing 3D line stretching into the future.
- **Mathematical Precision**: Accurately maps incomes and expenses on a day-to-day basis.
- **Risk Markers**: Identifies safe, warning, and danger zones based on your "Safe to Spend" margin.
- **Interactive Nodes**: Hover over or click on any future expense to view details and AI advice.

### 2. AI Timeline Rebalancer (Emergency Sequence)
A core feature that protects your financial mental health.
- If a sudden emergency hits (e.g., $300 Car Tow), your timeline mathematically fractures.
- **The Golden Path**: The AI instantly calculates an optimized recovery path by finding variable future expenses it can sacrifice or modify (e.g., downgrading an $85 dinner to a $15 coffee).
- **Mental Health Reinvestment**: The AI ensures you aren't isolated while budgeting by re-allocating small amounts for low-cost social activities.
- You can accept the AI's proposal to instantly "Heal the Timeline."

### 3. Smart Event Analysis
- Click on any upcoming expense to trigger a Gemini AI analysis.
- The AI can automatically draft "cost split" messages to your friends (e.g., suggesting a group gift instead of individual spending) to save you money without awkwardness.

### 4. Conversational Voice Bot
- A floating, interactive Voice Assistant powered by Gemini.
- Features API routes for transcript processing (`/api/process-intent`) to autonomously categorize voice inputs into incomes or expenses.

### 5. Google Calendar Syncing
- Seamlessly synchronize your upcoming calendar events to predict future social expenses before they happen.

## 🛠 Tech Stack

FinSight is built top-to-bottom with modern, high-performance web technologies:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **3D Visualization**: [Three.js](https://threejs.org/) & [React Three Fiber](https://r3f.docs.pmnd.rs/) with `@react-three/drei`
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Artificial Intelligence**: Google Generative AI (Gemini 2.5 Flash)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & `shadcn/ui` (under the hood)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: `date-fns` & `react-big-calendar`

## 💻 Getting Started

First, ensure you have your `GEMINI_API_KEY` set in your `.env.local` file.

Then, run the development server:

```bash
npm run dev
# or yarn dev / pnpm dev / bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
Interact with the timeline, click the event nodes, or hit the Lightning Bolt icon (God Mode) in the top right to trigger an emergency and see the AI Rebalancer in action!
