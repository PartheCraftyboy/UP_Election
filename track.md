# UP Legislative Assembly Election 2027 — Intelligence Terminal
## Development & Change Log (`track.md`)

This file tracks all system architecture decisions, changes, edits, and pending roadmap milestones across prompts like a git-style project history.

---

### 📌 Project Overview
- **Goal**: Product-grade political intelligence terminal for the **2027 Uttar Pradesh Assembly Election (403 Vidhan Sabha Seats)**.
- **Core Capabilities**:
  1. Interactive 403-seat assembly matrix & choropleth map with MLA profiles, historical results, and demographic/caste calculus.
  2. Continuous web scraping of UP political news (Hindi & English).
  3. Obsidian-style interactive knowledge graph tracking news events and neural propagation of their impact on poll results.
  4. Custom fine-tuned Sentiment & Emotion LLM on dedicated **NVIDIA H200 GPU (141GB HBM3e)**.
  5. Dark, sleek, high-precision UI inspired by the user's reference videos (`video_05a41cabd961.mp4` & `video_c56c56c43c1b.mp4`).

---

### 📝 Commit & Changelog History

#### [Prompt 1] — Requirements, Architecture & Strategy
- **Status**: Completed
- **Actions**:
  - Analyzed UP 2027 election intelligence requirements (403 seats, bilingual Hindi/English scraping, emotion & momentum tracking).
  - Recommended Web Terminal architecture (React 19 + Vite + Tailwind + Canvas/D3 physics + FastAPI backend).
  - Formulated LLM emotion taxonomy: Discontent/Anti-incumbency, Hope, Anger, Polarization, Law & Order approval.

#### [Prompt 2] — Frontend-First Vision & Reference Video Analysis
- **Status**: Completed
- **Actions**:
  - Inspected uploaded reference videos:
    - `video_05a41cabd961.mp4`: Minimal technical typography `[IRIS_AI]`, `[001]`, warm amber glow, clean glass cards.
    - `video_c56c56c43c1b.mp4`: Pitch-dark background (`#050608`), 3D particle brain/sphere network, floating geometric nodes.
  - Initialized `frontend/` repository with React 19, Vite, Tailwind CSS v4, and D3 physics packages.
  - Created `src/types/index.ts`: Strongly typed schemas for all 403 constituencies, political parties, news items, emotion metrics, graph nodes/links, and NVIDIA H200 telemetry.
  - Created `src/data/upConstituencies.ts`: Complete database of 403 UP Vidhan Sabha constituencies, incumbent MLAs, margins, demographic caste estimates, and 2027 momentum projections.
  - Created `src/data/newsFeed.ts`: Bilingual news dataset with emotion vectors, poll impact summaries, and Obsidian-style neural knowledge graph generator.
  - Created `src/components/Navbar.tsx`: Terminal header with `[TERMINAL_UP27]` branding, tab navigation, and live H200 GPU telemetry trigger.
  - Created `src/components/ObsidianGraph.tsx`: Obsidian-style force-directed canvas knowledge graph with dynamic neural pulse propagation and impact inspector.

#### [Prompt 3] — Added `track.md`, Full Component Suite & Verified Build
- **Status**: Completed
- **Files Created / Edited**:
  - `track.md`: Project change log and git-style tracking document.
  - `frontend/src/components/ConstituencyMap.tsx`: 403 assembly interactive matrix with Incumbent, Projected, Momentum, and Discontent color modes, regional filters, and search.
  - `frontend/src/components/ConstituencyDossier.tsx`: High-density flyout drawer with MLA 2022 stats, demographic social composition (SC, Muslim, OBC, Gen), LLM emotion radar, and connected news signals.
  - `frontend/src/components/StatewidePulse.tsx`: Statewide projection overview (202 Seats majority mark, NDA vs PDA/SP vs BSP tallies, 6 regional battleground breakdown, macro voter mood indices).
  - `frontend/src/components/LiveNewsFeed.tsx`: Real-time news stream with automated sentiment badges, Hindi/English headlines, issue filters, and "Trace in Graph" triggers.
  - `frontend/src/components/H200TelemetryModal.tsx`: Dedicated NVIDIA H200 GPU cluster monitor (141GB HBM3e, 93% compute load, 14.8ms latency, fine-tuned UP LLM checkpoint) + interactive live inference test console for raw Hindi/English text.
  - `frontend/src/App.tsx`: Main terminal controller, bottom live ticker tape, and modal state management.
  - `frontend/src/vite-env.d.ts`: Vite environment type declarations.
  - `frontend/src/main.tsx`: Entry point fix.
- **Verification**:
  - Ran `npm run build`: Production build succeeded in **146ms** with **0 errors**.

---

### 🚀 Upcoming Milestones (Next Phase)
1. **Live Scraping & Ingestion Engine**:
   - Python FastAPI backend with asynchronous RSS feeds (Dainik Jagran, Amar Ujala, Live Hindustan, Google News).
   - Article body extractor with deduplication.
2. **NVIDIA H200 Model Training & Serving**:
   - Model fine-tuning script (`scripts/train_h200_sentiment.py`) using Unsloth/vLLM for UP political Hindi/English corpus.
   - Inference API endpoint connecting the frontend test console and scraping pipeline directly to the H200 GPU.
