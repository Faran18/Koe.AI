# Koe.AI

Conversation with Gemini
this is my project developement detail , make a github repo readme file

                            +-------------------+
                            |    User Voice/    |
                            |   Text Interface  |
                            +---------+---------+
                                      |
                    +-----------------+-----------------+
                    |                                   |
            [ Push-To-Talk ]                    [ Streaming WS ]
                    |                                   |
            +-------v-------+                   +-------v-------+
            |  STT Service  |                   | Streaming STT |
            +-------+-------+                   +-------+-------+
                    |                                   |
                    +-----------------+-----------------+
                                      |
                                [ User Prompt ]
                                      |
                             +--------v--------+
                             |  LangGraph Agent|
                             |   State Machine |
                             +--------+--------+
                                      |
            +-------------------------+-------------------------+
            |                                                   |
+-----------v-----------+                           +-----------v-----------+
|   Intent Classifier   |                           |    Session Context    |
| & FAQ / Policy Guard  |                           |     (Redis Cache)     |
+-----------+-----------+                           +-----------+-----------+
            |                                                   |
    +-------+-------+                                           |
    |               |                                           |
[ Policy ]     [ Product ]                                      |
    |               |                                           |
+-------v-------+ +-----v-------------------------------------------v---+
|  pgvector RAG | |                     Tool Router                     |
|  Store Policy | |           (Validation Layer & Pydantic Guard)       |
+---------------+ +-----+-------------------+-------------------+-------+
|                   |                   |
+--------v-------+  +--------v-------+  +--------v-------+
|  Catalog REST  |  |   Cart State   |  |   Playwright   |
|     APIs       |  |   Operations   |  | Browser Engine |
+----------------+  +----------------+  +----------------+


---

## ✨ Key Features & Capabilities

### 🛍️ Full E-Commerce Platform
* **Rich Filtering & Search**: Filter products by category, gender, color, size, fit, material, price range, and rating.
* **Dynamic Cart Management**: Real-time quantity adjustments, variant selection, and cart summaries.
* **Structured Seed Data**: Out-of-the-box seed script generating 200–500 realistic items across multi-level taxonomy.

### 🧠 Agent & LLM Architecture
* **Strict Tool Router**: All tool calls (`search_products`, `apply_filter`, `add_to_cart`, `start_checkout`, etc.) are runtime-validated with Pydantic schemas.
* **Incremental Context Merging**: Merges filter parameters across conversation turns without re-asking established preferences.
* **LangGraph Flow Control**: Enforces state machine transitions, including mandatory confirmation nodes for checkout actions.

### 🎙️ Speech Processing Subsystem
* **Modular Provider Interfaces**: Extensible `SpeechToText` and `TextToSpeech` abstractions allowing seamless swapping between OpenAI Whisper, ElevenLabs, Deepgram, or local models.
* **Real-time Streaming**: Full-duplex WebSocket architecture for live transcripts, streaming LLM token generation, and low-latency audio chunking with barge-in support.

### 🌐 Autonomous Browser Agent (Fallback)
* **DOM Navigation**: Playwright engine configured with structured page-state extraction for navigating external or un-API'd websites.
* **Self-Correction**: Basic recovery heuristics to handle missing elements or altered layout selectors.

### 📊 Observability & Evals
* **Tracing & Diagnostics**: Native Langfuse integration tracking end-to-end token consumption, execution paths, and model performance.
* **Latency Decomposition**: Separate timing metrics for STT, LLM inference, Tool execution, and TTS delivery.
* **Regression Testing**: Evaluation suite running benchmark test suites to verify tool selector accuracy and conversation completion rate.

---

## 🛠️ Tech Stack Summary

| Layer | Component | Technologies Used |
| :--- | :--- | :--- |
| **Frontend** | Application / UI | Next.js 14 (App Router), React, Tailwind CSS |
| **Backend** | API Engine | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| **Database** | Relational / Vectors | PostgreSQL 16+, `pgvector` extension |
| **Cache & Session**| State Storage | Redis 7+ |
| **Orchestration** | Agent Framework | LangGraph, LangChain |
| **Voice / Speech** | STT / TTS | OpenAI Whisper, Deepgram, ElevenLabs (behind unified abstractions) |
| **Automation** | Web Scraping/Control | Playwright |
| **Observability** | Tracing & Evals | Langfuse, Pytest |
| **DevOps** | Containerization | Docker, Docker Compose |

---

## 📂 Repository Structure

.
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers & endpoint handlers
│   │   ├── core/            # Config, security, database connections
│   │   ├── db/              # SQLAlchemy / SQLModel models & migrations
│   │   ├── services/        # Business logic (Catalog, Cart, Orders)
│   │   ├── agent/           # LangGraph state machine, prompts, tool definitions
│   │   ├── rag/             # Vector embeddings, pgvector store retriever
│   │   ├── voice/           # STT & TTS provider implementations
│   │   └── browser/         # Playwright automation agent
│   ├── alembic/             # Database migration scripts
│   ├── tests/               # Unit, integration, and agent evals
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages (Catalog, Cart, Checkout)
│   │   ├── components/      # UI components, Chat modal, Voice PTT button
│   │   ├── hooks/           # Custom React hooks for voice & WebSocket state
│   │   └── lib/             # API client & helper utilities
│   ├── public/              # Static assets
│   ├── Dockerfile
│   └── package.json
├── evaluation/              # Agent evaluation benchmarks & test sets
├── docker/                  # Docker initialization & setup scripts
├── docker-compose.yml       # Orchestrates Postgres, Redis, Backend, Frontend
└── README.md


---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
* **Docker** and **Docker Compose**
* **Python 3.11+**
* **Node.js 18+** & `npm` / `pnpm`

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/voice-shopping-agent.git](https://github.com/your-username/voice-shopping-agent.git)
cd voice-shopping-agent
2. Environment Configuration
Copy the sample environment files for both backend and frontend:

Bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
Configure your API keys in backend/.env:

Code snippet
# Database & Redis
DATABASE_URL=postgresql+asyncpg://agent:password@localhost:5432/shopping_db
REDIS_URL=redis://localhost:6379/0

# LLM & Voice Providers
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# Observability
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=[https://cloud.langfuse.com](https://cloud.langfuse.com)
3. Run via Docker Compose
Spin up PostgreSQL (with pgvector), Redis, FastAPI backend, and Next.js frontend:

Bash
docker-compose up --build
Access the application components:

Frontend UI: http://localhost:3000

FastAPI Docs: http://localhost:8000/docs

Langfuse Dashboard: http://localhost:3000 (or configured host)

4. Database Seeding
Seed the database with sample products and category hierarchies:

Bash
docker-compose exec backend python -m app.db.seed
🛣️ Phased Architecture Roadmap
Phase	Description	Key Deliverables / Checkpoints
Phase 0: Setup	Monorepo & Infra	Docker Compose (Postgres + Redis), Next.js + FastAPI boots
Phase 1: E-Commerce Base	REST & Store UI	Products DB, REST APIs, static seed script, UI catalog/cart
Phase 2: Text Agent	LLM Tool Loop	Chat UI, basic tool schemas (search, filter, cart), action execution
Phase 3: Agent Expansion	Robust Tool Router	Tool Router layer, Pydantic validation, complete navigation actions
Phase 4: Session Memory	Redis Context	State object in Redis, multi-turn filter merging, SQL turn persistence
Phase 5: Store Policy RAG	pgvector FAQ QA	Markdown docs, pgvector embeddings, policy query router
Phase 6: Push-To-Talk	Voice Integration	Audio capture UI, SpeechToText/TextToSpeech API wrappers
Phase 7: Realtime Voice	Streaming Pipeline	Duplex WebSockets, streaming STT/LLM/TTS, barge-in detection
Phase 8: Browser Agent	Playwright Automation	DOM state extraction, fallback web navigation agent
Phase 9: Human-in-Loop	Safe Checkout	LangGraph state machine confirmation gate before order placement
Phase 10: Observability	Diagnostics & Evals	Langfuse tracing, STT/LLM/TTS latency breakdown, automated eval suite
🛠 Tool Reference
The agent utilizes a structured set of Pydantic-validated tools to interact safely with the store:

Tool Name	Parameters	Description
search_products	query, category, gender, max_price, color, size	Queries product database with dynamic filters
open_category	category, gender	Navigates to specific category/department view
apply_filter	filter_name, filter_value	Refines active search results
get_product_details	product_id	Retrieves full specs, sizes, and stock availability
add_to_cart	product_id, variant_id, quantity	Adds designated product variant to session cart
view_cart	None	Fetches active cart summary and calculated totals
retrieve_store_info	query	Executes RAG search across store policies/FAQ docs
start_checkout	None	Initiates order summary and requests human confirmation
🧪 Testing & Evaluation
Run backend unit and integration tests:

Bash
docker-compose exec backend pytest tests/unit tests/integration
Run agent tool-selection evaluation benchmarks:

Bash
docker-compose exec backend pytest evaluation/test_agent_evals.py
📄 License
This project is licensed under the MIT License — see the LICENSE file for details.
"""

with open("README.md", "w", encoding="utf-8") as f:
f.write(readme_content)

print("README.md generated successfully.")


```text?code_stdout&code_event_index=1
README.md generated successfully.

Your Markdown file is ready

MD icon
README
 MD 
Open
Overview of the Generated README.md
I have created a GitHub repository README.md tailored specifically to your Voice Shopping Agent architecture and implementation roadmap.

What's Included:
Badges & Hero Section: Clean Shields.io badges for Python 3.11+, FastAPI, Next.js 14, LangGraph, PostgreSQL, and Redis.

Project Overview: Explains the core value proposition — an end-to-end voice AI platform with a controlled e-commerce site, tool validation layer, memory state machine, dual-track RAG, and streaming voice options.

ASCII Architecture Diagram: Visualizes the flow from Voice/Text input through Speech-to-Text, LangGraph state machine, Redis session context, pgvector RAG, deterministic Tool Router, and backend APIs / Playwright browser fallback.

Key Features & Capabilities: Highlights product discovery, Pydantic-validated tool router, incremental memory merging, speech abstractions, Playwright DOM navigation, and human-in-the-loop safeguards.

Tech Stack Table: Summarizes Frontend, Backend, Database, Cache, Orchestration, STT/TTS, and Observability choices.

Monorepo Directory Layout: Clean tree layout for frontend/, backend/, evaluation/, and docker/.

Getting Started & Setup Guide: Docker Compose instructions, step-by-step .env configuration, and database seeding commands.

Phased Roadmap Table: Maps out Phases 0 through 10 with clear deliverables and milestones.

Tool Reference Table: Explains each agent tool (search_products, apply_filter, add_to_cart, retrieve_store_info, start_checkout, etc.) with parameters and descriptions.

Testing & Evaluation: Commands for running Pytest unit tests and Langfuse-backed agent benchmarks.




Gemini is AI and can make mistakes.

Describing Tests
# 🎙️ Voice Shopping Agent

> **An end-to-end, voice-enabled autonomous AI shopping platform built with FastAPI, Next.js, LangGraph, and PostgreSQL/pgvector.**

[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agent-orange.svg)](https://www.langchain.com/langgraph)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7%2B-DC382D.svg)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Overview

The **Voice Shopping Agent** is an intelligent e-commerce system that allows users to interact naturally with a store using spoken language or text. Unlike simple wrapper bots, this architecture combines a full-featured e-commerce web platform with a multi-layered agentic system:

* **Controlled E-Commerce Core**: Full REST product catalog, faceted filtering, dynamic cart management, and checkout flows.
* **Deterministic Tool Router & Validation Layer**: Strict isolation preventing the LLM from touching the database or browser directly.
* **Stateful Conversation Memory**: Contextual intent extraction with Redis caching and PostgreSQL turn persistence.
* **Dual-Track Knowledge System**: Clean separation between vector-based FAQ/Policy RAG and structured product database queries.
* **Voice Subsystem**: Support for both Push-to-Talk (PTT) audio processing and ultra-low-latency real-time streaming voice with interruption handling.
* **Browser Navigation Fallback**: Playwright-driven autonomous agent capable of DOM interaction when working with external storefronts.
* **Human-in-the-Loop Safeguards**: Explicit confirmation gates enforced via LangGraph state machines prior to order placement.
* **Production Observability**: Fine-grained trace logging, latency breakdowns (STT/LLM/TTS/Tools), and automated conversation evaluation via Langfuse.

---

## 🏗 System Architecture

```
                                +-------------------+
                                |    User Voice/    |
                                |   Text Interface  |
                                +---------+---------+
                                          |
                        +-----------------+-----------------+
                        |                                   |
                [ Push-To-Talk ]                    [ Streaming WS ]
                        |                                   |
                +-------v-------+                   +-------v-------+
                |  STT Service  |                   | Streaming STT |
                +-------+-------+                   +-------+-------+
                        |                                   |
                        +-----------------+-----------------+
                                          |
                                    [ User Prompt ]
                                          |
                                 +--------v--------+
                                 |  LangGraph Agent|
                                 |   State Machine |
                                 +--------+--------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
    +-----------v-----------+                           +-----------v-----------+
    |   Intent Classifier   |                           |    Session Context    |
    | & FAQ / Policy Guard  |                           |     (Redis Cache)     |
    +-----------+-----------+                           +-----------+-----------+
                |                                                   |
        +-------+-------+                                           |
        |               |                                           |
    [ Policy ]     [ Product ]                                      |
        |               |                                           |
+-------v-------+ +-----v-------------------------------------------v---+
|  pgvector RAG | |                     Tool Router                     |
|  Store Policy | |           (Validation Layer & Pydantic Guard)       |
+---------------+ +-----+-------------------+-------------------+-------+
                        |                   |                   |
               +--------v-------+  +--------v-------+  +--------v-------+
               |  Catalog REST  |  |   Cart State   |  |   Playwright   |
               |     APIs       |  |   Operations   |  | Browser Engine |
               +----------------+  +----------------+  +----------------+
```

---

## ✨ Key Features & Capabilities

### 🛍️ Full E-Commerce Platform
* **Rich Filtering & Search**: Filter products by category, gender, color, size, fit, material, price range, and rating.
* **Dynamic Cart Management**: Real-time quantity adjustments, variant selection, and cart summaries.
* **Structured Seed Data**: Out-of-the-box seed script generating 200–500 realistic items across multi-level taxonomy.

### 🧠 Agent & LLM Architecture
* **Strict Tool Router**: All tool calls (`search_products`, `apply_filter`, `add_to_cart`, `start_checkout`, etc.) are runtime-validated with Pydantic schemas.
* **Incremental Context Merging**: Merges filter parameters across conversation turns without re-asking established preferences.
* **LangGraph Flow Control**: Enforces state machine transitions, including mandatory confirmation nodes for checkout actions.

### 🎙️ Speech Processing Subsystem
* **Modular Provider Interfaces**: Extensible `SpeechToText` and `TextToSpeech` abstractions allowing seamless swapping between OpenAI Whisper, ElevenLabs, Deepgram, or local models.
* **Real-time Streaming**: Full-duplex WebSocket architecture for live transcripts, streaming LLM token generation, and low-latency audio chunking with barge-in support.

### 🌐 Autonomous Browser Agent (Fallback)
* **DOM Navigation**: Playwright engine configured with structured page-state extraction for navigating external or un-API'd websites.
* **Self-Correction**: Basic recovery heuristics to handle missing elements or altered layout selectors.

### 📊 Observability & Evals
* **Tracing & Diagnostics**: Native Langfuse integration tracking end-to-end token consumption, execution paths, and model performance.
* **Latency Decomposition**: Separate timing metrics for STT, LLM inference, Tool execution, and TTS delivery.
* **Regression Testing**: Evaluation suite running benchmark test suites to verify tool selector accuracy and conversation completion rate.

---

## 🛠️ Tech Stack Summary

| Layer | Component | Technologies Used |
| :--- | :--- | :--- |
| **Frontend** | Application / UI | Next.js 14 (App Router), React, Tailwind CSS |
| **Backend** | API Engine | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| **Database** | Relational / Vectors | PostgreSQL 16+, `pgvector` extension |
| **Cache & Session**| State Storage | Redis 7+ |
| **Orchestration** | Agent Framework | LangGraph, LangChain |
| **Voice / Speech** | STT / TTS | OpenAI Whisper, Deepgram, ElevenLabs (behind unified abstractions) |
| **Automation** | Web Scraping/Control | Playwright |
| **Observability** | Tracing & Evals | Langfuse, Pytest |
| **DevOps** | Containerization | Docker, Docker Compose |

---

## 📂 Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/             # FastAPI routers & endpoint handlers
│   │   ├── core/            # Config, security, database connections
│   │   ├── db/              # SQLAlchemy / SQLModel models & migrations
│   │   ├── services/        # Business logic (Catalog, Cart, Orders)
│   │   ├── agent/           # LangGraph state machine, prompts, tool definitions
│   │   ├── rag/             # Vector embeddings, pgvector store retriever
│   │   ├── voice/           # STT & TTS provider implementations
│   │   └── browser/         # Playwright automation agent
│   ├── alembic/             # Database migration scripts
│   ├── tests/               # Unit, integration, and agent evals
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router pages (Catalog, Cart, Checkout)
│   │   ├── components/      # UI components, Chat modal, Voice PTT button
│   │   ├── hooks/           # Custom React hooks for voice & WebSocket state
│   │   └── lib/             # API client & helper utilities
│   ├── public/              # Static assets
│   ├── Dockerfile
│   └── package.json
├── evaluation/              # Agent evaluation benchmarks & test sets
├── docker/                  # Docker initialization & setup scripts
├── docker-compose.yml       # Orchestrates Postgres, Redis, Backend, Frontend
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:
* **Docker** and **Docker Compose**
* **Python 3.11+**
* **Node.js 18+** & `npm` / `pnpm`

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/voice-shopping-agent.git
cd voice-shopping-agent
```

### 2. Environment Configuration

Copy the sample environment files for both backend and frontend:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Configure your API keys in `backend/.env`:
```env
# Database & Redis
DATABASE_URL=postgresql+asyncpg://agent:password@localhost:5432/shopping_db
REDIS_URL=redis://localhost:6379/0

# LLM & Voice Providers
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# Observability
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com
```

### 3. Run via Docker Compose

Spin up PostgreSQL (with pgvector), Redis, FastAPI backend, and Next.js frontend:

```bash
docker-compose up --build
```

Access the application components:
* **Frontend UI**: `http://localhost:3000`
* **FastAPI Docs**: `http://localhost:8000/docs`
* **Langfuse Dashboard**: `http://localhost:3000` (or configured host)

### 4. Database Seeding

Seed the database with sample products and category hierarchies:

```bash
docker-compose exec backend python -m app.db.seed
```

---

## 🛣️ Phased Architecture Roadmap

| Phase | Description | Key Deliverables / Checkpoints |
| :--- | :--- | :--- |
| **Phase 0: Setup** | Monorepo & Infra | Docker Compose (Postgres + Redis), Next.js + FastAPI boots |
| **Phase 1: E-Commerce Base** | REST & Store UI | Products DB, REST APIs, static seed script, UI catalog/cart |
| **Phase 2: Text Agent** | LLM Tool Loop | Chat UI, basic tool schemas (`search`, `filter`, `cart`), action execution |
| **Phase 3: Agent Expansion** | Robust Tool Router | Tool Router layer, Pydantic validation, complete navigation actions |
| **Phase 4: Session Memory** | Redis Context | State object in Redis, multi-turn filter merging, SQL turn persistence |
| **Phase 5: Store Policy RAG** | pgvector FAQ QA | Markdown docs, pgvector embeddings, policy query router |
| **Phase 6: Push-To-Talk** | Voice Integration | Audio capture UI, `SpeechToText`/`TextToSpeech` API wrappers |
| **Phase 7: Realtime Voice** | Streaming Pipeline | Duplex WebSockets, streaming STT/LLM/TTS, barge-in detection |
| **Phase 8: Browser Agent** | Playwright Automation | DOM state extraction, fallback web navigation agent |
| **Phase 9: Human-in-Loop** | Safe Checkout | LangGraph state machine confirmation gate before order placement |
| **Phase 10: Observability** | Diagnostics & Evals | Langfuse tracing, STT/LLM/TTS latency breakdown, automated eval suite |

---

## 🛠 Tool Reference

The agent utilizes a structured set of Pydantic-validated tools to interact safely with the store:

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `search_products` | `query`, `category`, `gender`, `max_price`, `color`, `size` | Queries product database with dynamic filters |
| `open_category` | `category`, `gender` | Navigates to specific category/department view |
| `apply_filter` | `filter_name`, `filter_value` | Refines active search results |
| `get_product_details` | `product_id` | Retrieves full specs, sizes, and stock availability |
| `add_to_cart` | `product_id`, `variant_id`, `quantity` | Adds designated product variant to session cart |
| `view_cart` | None | Fetches active cart summary and calculated totals |
| `retrieve_store_info` | `query` | Executes RAG search across store policies/FAQ docs |
| `start_checkout` | None | Initiates order summary and requests human confirmation |

---

## 🧪 Testing & Evaluation

Run backend unit and integration tests:

```bash
docker-compose exec backend pytest tests/unit tests/integration
```

Run agent tool-selection evaluation benchmarks:

```bash
docker-compose exec backend pytest evaluation/test_agent_evals.py
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
README.md
Displaying README.md.
