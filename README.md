# TuringScout

**TuringScout** is your radar for the autonomous agent ecosystem. It acts as an AI industry "CookieDAO", aggregating signals from GitHub repositories, social sentiment, and developer communities to discover, evaluate, and launch next-generation AI and autonomous agent frameworks.

## 🚀 Features

- **Agent Launchpad & Radar**: A central hub to discover the latest open-source AI projects.
- **Dynamic Hype Factor Tracking**: Browse projects easily across various timelines (`24H Hot`, `48H Hot`, `7 Day Trend`, and `All Time High`). Track metrics analyzing stars, forks, KOL mentions, and repo growth—highlighting the "hot" projects before they hit mainstream.
- **AI-Powered Evaluation (TuringScout Eval)**: Using integrated Gemini models to automatically score projects across dimensions like maturity, ecosystem vitality, code quality, and maintainability.
- **Dynamic Community Feed**: A vibrant, real-time community feed powered by `framer-motion` that auto-scrolls seamlessly. It showcases raw developer tweets alongside **AI Summarized** ecosystem signals with actionable insights.
- **Categories & Tech Tagging**: Seamlessly filter and discover projects through structured technology tags like `LLM Orchestration`, `DeFi & Trading`, `Social Bots`, `Computer Vision`, `Reinforcement Learning`, `NFT & Gaming`, and `Data Indexing`.
- **Opportunities & Bounties (Perks & Leaks)**: Connects developers with projects via early-stage bounties, hackathons, and contribution opportunities right from the dashboard.
- **A2A Agent Marketplace**: Browse and interact with A2A-enabled agents registered on the platform. Agents expose capabilities via the Google A2A Protocol and can be invoked directly from the UI.
- **x402 Blockchain Payments (Solana / EVM / HTX)**: Pay for agent services on-chain using the x402 protocol. Supports USDC payments across Solana (SVM), EVM (Base), and HTX (Huobi Chain) with automatic on-chain verification.
- **Live Social Ticker**: A continuous real-time market ticker across the top of the app bringing you the latest breaking agent news and ecosystem hype.

## 🏗️ Technical Architecture

This application is built as a **Full-Stack Application** using Vite + React + Express.

- **Frontend**: React 19, React Router, Tailwind CSS v4, `motion` (Framer Motion) for buttery-smooth animations, and Recharts for dynamic charts.
- **Backend**: Express server integrated seamlessly via Vite Middleware (`server.ts`).
- **Database**: SQLite powered by Prisma ORM.
- **AI Integration**: `@google/genai` (Gemini API) for producing thorough evaluations and orchestrating data processing dynamically.
- **A2A Protocol**: Implements the Google Agent-to-Agent (A2A) protocol for agent discovery, task submission, and async artifact retrieval.
- **x402 Payment Layer**: On-chain payment verification using `@solana/web3.js` and `viem` for Solana, EVM, and HTX settlement.

## 🛠️ Backend Developer Guide

This application features a custom Express server embedded within the Vite build process. For backend developers, here is how you can extend the functionality:

### 1. Server Architecture (`server.ts`)
The server uses **Express** and handles both API routes and Vite's frontend assets.
- **Location:** The main entry point is `server.ts`.
- **Routing:** All backend routes should be mounted before the Vite middleware or static file handlers. Prefix your APIs with `/api/*` to maintain separation of concerns.
- **Example Route Implementation:**
  ```typescript
  import express from 'express';
  const app = express();

  // Add your new routes here
  app.get('/api/community/feed', async (req, res) => {
    // Fetch from database or external API
    res.json({ items: [] });
  });
  ```

### 2. Database & Data Modeling (`prisma/schema.prisma`)
The project utilizes **Prisma** with **SQLite** by default, but it's architected to easily swap to PostgreSQL or MySQL.
- Define your models in `prisma/schema.prisma`.
- Whenever you change the schema, run `npx prisma db push` (for prototyping) or use `npx prisma migrate dev` (for structured migrations).
- Prisma Client is typically instantiated in `/src/lib/prisma.ts` or directly within the server routes.

### 3. AI & LLM Endpoints
- The application integrates the `@google/genai` library.
- Keep all Gemini API calls server-side to secure your `GEMINI_API_KEY`.
- You can create helper modules to perform AI summaries and use them within your `/api/` endpoints, enabling features like evaluating ecosystem signal metrics.

### 4. A2A Protocol & Agent Marketplace
- **Agent Cards** are stored in the `AgentCard` table and exposed via `/api/agents`.
- **Services** define agent capabilities, pricing, and accepted blockchain networks.
- **Task Lifecycle**: `POST /api/a2a/tasks/send` → `GET /api/a2a/tasks/:id` → `POST /api/a2a/tasks/:id/cancel`.
- Free services return `202 Accepted` immediately. Paid services return `402 Payment Required` with x402 requirements.

### 5. x402 Blockchain Payments
- **Supported Chains**: Solana (USDC SPL), EVM Base (USDC ERC-20), HTX (USDC ERC-20).
- **Payment Flow**:
  1. Client requests service → Server responds `402` with `requirements` (chain, amount, payee).
  2. Client signs and broadcasts on-chain transaction.
  3. Client submits `txHash` to `POST /api/payments/verify`.
  4. Server verifies transaction via public RPC and marks payment `CONFIRMED`.
- **Verification**: Uses `@solana/web3.js` for Solana and `viem` for EVM/HTX chains.
- **API Endpoints**:
  - `POST /api/payments/request` — Create a payment request.
  - `POST /api/payments/verify` — Verify on-chain payment with txHash.
  - `GET /api/payments/:id` — Query payment status.

## 💻 Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   # Push schema to local SQLite database
   npx prisma db push

   # Seed the database
   npx prisma db seed
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` and fill in necessary configuration parameters.
   ```
   DATABASE_URL="file:./dev.db"
   GEMINI_API_KEY="your_api_key"
   ADMIN_PASSWORD="turingscout-admin"
   PORT=3000

   # Blockchain platform wallets (for receiving x402 payments)
   PLATFORM_WALLET_SOLANA="your_solana_wallet"
   PLATFORM_WALLET_EVM="your_evm_wallet"
   PLATFORM_WALLET_HTX="your_htx_wallet"

   # Optional RPC endpoints
   SOLANA_RPC="https://api.mainnet-beta.solana.com"
   EVM_RPC="https://mainnet.base.org"
   HTX_RPC="https://http-mainnet.hecochain.com"
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *The server runs locally on `http://localhost:3000` via tsx.*

## 🧪 Production Build

To build the project for production deployment:

```bash
npm run build
```

The production entry point handles both the API routes via Express and serves the static files from the `dist/` directory. By starting with `npm start`, Node runs the backend code handling static files directly.

---
*Built with ❤️ for the AI Developer Community.*
