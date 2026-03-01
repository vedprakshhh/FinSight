# FinSight

### The AI That Manages Your Financial Life Around Your Actual Life

FinSight is not a budgeting app.

It is an AI-powered financial dashboard that anticipates expenses, visualizes budget health in immersive 3D space, and intelligently rebalances your future when life throws a curveball.

Instead of reacting to transactions, FinSight predicts financial conflicts before they happen — and helps you resolve them instantly.

---

## The Core Idea

Money is dynamic.
Your life is dynamic.

So why are budgeting tools static?

FinSight analyzes your upcoming commitments, projects their financial impact, and visualizes your budget as a living timeline stretching into the future.

When unexpected events occur — a dinner, a trip, an emergency expense — the system does more than warn you.

It recalculates your path forward.

---

## Key Features

### 1. ThreeWave — 3D Financial Timeline

Your balance becomes a glowing 3D path into the future.

* Day-by-day projection of income and expenses
* Safe / Warning / Danger zones based on Safe-to-Spend margin
* Interactive nodes for upcoming expenses
* Real-time updates when financial states change

This transforms abstract numbers into spatial awareness.

You don’t just read your budget.
You experience it.

---

### 2. AI Timeline Rebalancer (Emergency Mode)

When an unexpected expense occurs:

Example: `$300 Car Tow`

Your timeline fractures.

FinSight instantly calculates:

* Which future expenses are adjustable
* How to downgrade spending without eliminating social life
* An optimized recovery strategy
* A balanced plan that protects mental well-being

The result is called **The Golden Path** — a recalculated financial recovery route.

With one click, you can “Heal the Timeline.”

---

### 3. Smart Event Analysis (Powered by Gemini)

Click any upcoming expense to trigger AI analysis.

FinSight uses **Google Gemini 2.5 Flash** to:

* Forecast overspending risks
* Quantify potential budget conflicts
* Suggest three optimized alternatives
* Draft socially intelligent cost-sharing messages
* Estimate acceptance probability for proposed changes

Financial intelligence meets social awareness.

---

### 4. Conversational Voice Assistant (Powered by ElevenLabs)

FinSight includes a dynamic voice layer that responds to your financial state.

Using **ElevenLabs Turbo v2.5**, the system generates real-time speech with three adaptive personas:

* Urgent Mode — Calm but firm when entering danger zones
* Neutral Mode — Reassuring guidance when stable
* Joy Mode — Celebratory reinforcement when savings improve

All speech is generated live from AI responses.

No static recordings.
No pre-rendered audio.

This transforms the dashboard into an interactive financial companion.

---

### 5. Conversational Intent Processing

FinSight includes a voice processing pipeline:

`/api/process-intent`

Voice transcripts are analyzed and categorized into:

* Income
* Expense
* General financial query

This allows natural interaction with the system.

---

### 6. Google Calendar Synchronization

FinSight integrates upcoming calendar events to:

* Predict future social expenses
* Detect overlapping financial risks
* Provide early warnings before spending occurs

Prevention replaces reaction.

---

## Technology Stack

FinSight is built using modern, high-performance web technologies.

### Framework

Next.js 16 (App Router)

### Frontend

React 19
TypeScript
Tailwind CSS v4
shadcn/ui and Radix UI
Lucide Icons

### 3D Visualization

Three.js
React Three Fiber
@react-three/drei

### State & Logic

Zustand
date-fns
react-big-calendar

### Artificial Intelligence

Google Gemini 2.5 Flash

* Event analysis
* Conflict forecasting
* Timeline rebalancing

### Voice Generation

ElevenLabs Turbo v2.5

* Multi-persona voice responses
* Real-time text-to-speech generation

### Deployment

DigitalOcean App Platform

### Data Layer/Database 

Snowflake

---

## API Routes

FinSight exposes modular AI endpoints:

| Route                 | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `/api/analyze-event`  | Gemini event risk analysis                           |
| `/api/speak`          | ElevenLabs text-to-speech                            |
| `/api/process-intent` | Categorizes voice transcripts into financial actions |

Each route operates independently.
If one fails, the core experience remains stable.

---

## Running Locally

### 1. Set Environment Variables

Create a `.env.local` file:

```
GEMINI_API_KEY=your_gemini_key

ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID_URGENT=voice_id_1
ELEVENLABS_VOICE_ID_NEUTRAL=voice_id_2
ELEVENLABS_VOICE_ID_JOY=voice_id_3
ELEVENLABS_MODEL_ID=eleven_turbo_v2_5
```

---

### 2. Install Dependencies

```
npm install
```

---

### 3. Start Development Server

```
npm run dev
```

Open:

```
http://localhost:3000
```

Interact with the 3D timeline, click event nodes, and trigger Emergency Mode to see the AI Rebalancer in action.

---

## Vision

FinSight redefines financial experience design.

It transforms budgeting from:

Reactive → Predictive
Static → Spatial
Stressful → Supportive
Numbers → Narrative

FinSight doesn’t just track your money.

It manages your financial life around your real life.

---

