# 🔬 InsightForge · Autonomous Multi-Agent AI Research Platform

> An enterprise-grade, full-stack AI research tool that orchestrates specialized autonomous agents (**Search**, **Reader**, **Writer**, **Critic**) to discover, deep-scrape, synthesize, critique, and export deep technical reports in real time.

---

## 🌟 Key Features & Upgrades

- **⚡ Real-Time Multi-Agent Activity Stream:** 
  Watch each agent think, formulate search vectors, perform deep DOM scraping, stream synthesis tokens, and calculate rubric scores live via Server-Sent Events (SSE).
- **🔬 4-Agent Pipeline:**
  - **Search Agent:** Queries Tavily for authoritative citations, extracts favicons, and discovers key knowledge vectors.
  - **Reader Agent:** Performs deep DOM scraping, filters boilerplate, and distills high-density contextual text.
  - **Writer Chain:** Synthesizes structured GitHub-flavored Markdown reports with tone and depth controls.
  - **Critic Agent:** Evaluates factual rigor on a 0–10 scale, lists concrete strengths and areas for improvement, and offers a concise verdict.
- **🔄 1-Click Critic Feedback Loop:**
  Iterate automatically by passing the Critic Agent's suggestions directly back into the synthesis engine with one click.
- **⚖️ Multi-Topic Comparison Studio (`/compare`):**
  Run two research queries side-by-side (e.g. *Rust vs Go for Microservices*) to evaluate comparative trade-offs simultaneously.
- **📝 Interactive Inline Editor & Formatting:**
  Edit and fine-tune AI-generated reports directly inline before saving or publishing.
- **📑 Multi-Format Export Suite:**
  One-click export to styled **PDF** (via ReportLab), clean **Markdown (.md)**, **JSON**, or generate a shareable public link (`/share/:id`).
- **📚 Searchable Research Library (`/library`):**
  Filter past research sessions by tag, search by topic keyword, or pin favorites.
- **📊 Usage & Cost Dashboard (`/analytics`):**
  Real-time token counters, model cost calculators (`gpt-4o-mini` vs `gpt-4o`), and latency telemetry.
- **⚡ Zero-Config Demo Mode:**
  Built-in simulation mode allows full UI and agent workflow testing out of the box without requiring API keys.
- **🎨 Linear / Perplexity Design System:**
  Modern glassmorphic dark palette (`#0a0a0f`), warm amber gradient accents (`#ff8c32` to `#ff5030`), Syne/DM Sans typography, and global Command Palette (`⌘K`).

---

## 🏗️ Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────────┐
                     │            Next.js App Router UI             │
                     │  (TypeScript + Tailwind CSS + Framer Motion) │
                     └──────────────────────┬───────────────────────┘
                                            │ REST & SSE Stream
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │              FastAPI Backend                 │
                     │    (Async SQLAlchemy + Pydantic v2 + SSE)    │
                     └──────┬───────────────┬────────────────┬──────┘
                            │               │                │
            ┌───────────────▼┐      ┌───────▼────────┐      ┌▼──────────────┐
            │  Search Agent  │      │  Reader Agent  │      │ Writer/Critic │
            │ (Tavily Engine)│      │  (Deep Scrape) │      │ (ChatOpenAI)  │
            └────────────────┘      └────────────────┘      └───────────────┘
```

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, React Markdown, Remark GFM, Canvas Confetti.
- **Backend:** FastAPI, Python 3.11+, SQLAlchemy Async, aiosqlite / asyncpg, LangChain & LangChain-OpenAI, Tavily Python, BeautifulSoup4, ReportLab.
- **Database:** SQLite (async via aiosqlite for zero-setup local dev) or PostgreSQL.

---

## 🚀 Quickstart Guide

### Option 1: Local Development

#### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# (Optional) Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed sample database
python seed_data.py

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will be live at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/api/v1/docs`.

#### 2. Frontend Setup
```bash
# Navigate to frontend in a new terminal
cd frontend

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

### Option 2: Docker Compose

```bash
# Clone and enter directory
cd multi-agent-system

# Create .env from template
cp .env.example .env

# Launch frontend & backend
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `OPENAI_API_KEY` | OpenAI API key for `gpt-4o-mini` and `gpt-4o` | *Optional in Demo Mode* |
| `TAVILY_API_KEY` | Tavily Search API key for web discovery | *Optional in Demo Mode* |
| `DATABASE_URL` | SQLAlchemy async connection string | `sqlite+aiosqlite:///./insightforge.db` |
| `NEXT_PUBLIC_API_URL`| Frontend API endpoint | `http://localhost:8000/api/v1` |
| `DEFAULT_MODEL` | Default model identifier | `gpt-4o-mini` |

---

## 🧪 Testing

Run backend unit and integration tests:
```bash
cd backend
python -m pytest tests/test_api.py -v
```

Verify frontend production build:
```bash
cd frontend
npm run build
```

---

## 📄 License
MIT License. Built for autonomous research and verified knowledge synthesis.
