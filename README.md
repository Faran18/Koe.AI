# 🎙️ Koe.AI

> **An agentic, voice-enabled e-commerce shopping assistant built with LangGraph, FastAPI, Next.js, PostgreSQL, Redis, RAG, and real-time speech processing.**

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agent-orange.svg)](https://www.langchain.com/langgraph)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7%2B-DC382D.svg)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Overview

**Koe.AI** is an agentic e-commerce platform that allows customers to interact with an online store using **natural language, text, or voice**.

Instead of acting as a simple chatbot, Koe.AI can understand customer intent, maintain conversational context, search and filter products, manage the shopping cart, answer store-policy questions, navigate the storefront, and guide customers through checkout.

The system combines:

* 🧠 **LangGraph-based agent orchestration**
* 🛠️ **Pydantic-validated tool execution**
* 🛍️ **Structured e-commerce APIs**
* 🧾 **RAG for store policies and FAQs**
* 🧠 **Redis-based conversational state**
* 🎙️ **Push-to-talk and real-time voice interaction**
* 🌐 **Playwright browser automation fallback**
* 🔐 **Human confirmation before checkout**
* 📊 **Langfuse observability and agent evaluations**

The goal is to build an AI shopping assistant that behaves more like a **personal sales assistant** than a traditional website chatbot.

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │    User Interface     │
                         │   Voice / Text / UI   │
                         └───────────┬───────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
             Push-To-Talk                      Streaming WebSocket
                    │                                 │
             ┌──────▼──────┐                  ┌──────▼──────┐
             │     STT     │                  │ Streaming   │
             │   Service   │                  │     STT     │
             └──────┬──────┘                  └──────┬──────┘
                    │                                 │
                    └────────────────┬────────────────┘
                                     │
                              User Prompt
                                     │
                         ┌───────────▼───────────┐
                         │   LangGraph Agent     │
                         │     State Machine     │
                         └───────────┬───────────┘
                                     │
              ┌──────────────────────┴──────────────────────┐
              │                                             │
     ┌────────▼────────┐                           ┌────────▼────────┐
     │ Intent / Policy │                           │ Session Context │
     │    Classifier   │                           │      Redis      │
     └────────┬────────┘                           └────────┬────────┘
              │                                             │
       ┌──────┴───────┐                                     │
       │              │                                     │
    Policy         Product                                  │
       │              │                                     │
┌──────▼──────┐       │                                     │
│  pgvector   │       │                                     │
│  Policy RAG │       │                                     │
└─────────────┘       │                                     │
                      └────────────────┬────────────────────┘
                                       │
                              ┌────────▼────────┐
                              │   Tool Router   │
                              │                 │
                              │ Pydantic Guard  │
                              └────────┬────────┘
                                       │
                ┌──────────────────────┼─────────────────────┐
                │                      │                     │
        ┌───────▼────────┐    ┌────────▼────────┐   ┌──────▼─────────┐
        │ Catalog REST   │    │   Cart / Order  │   │   Playwright   │
        │      APIs      │    │    Operations   │   │ Browser Agent  │
        └────────────────┘    └─────────────────┘   └────────────────┘
```

---

# ✨ Key Features

## 🛍️ Agentic E-Commerce

Koe.AI is built around a complete e-commerce workflow rather than a standalone chatbot.

### Product Discovery

* Search products using natural language
* Filter by:

  * Category
  * Gender
  * Color
  * Size
  * Fit
  * Material
  * Price
  * Rating
* Retrieve detailed product information
* Check available variants and stock
* Navigate directly to relevant store categories

Example:

> **User:** "Show me some black men's shirts under $50."

The agent can interpret the request, call the appropriate product-search tool, and return relevant products.

---

## 🧠 Agentic Architecture

### LangGraph State Machine

The agent is orchestrated using **LangGraph**, allowing explicit control over conversation state and execution flow.

The graph can handle:

```text
User Request
     │
     ▼
Intent Detection
     │
     ├── Product Request ──► Product Tools
     │
     ├── Store Question ──► RAG
     │
     ├── Cart Action ─────► Cart Tools
     │
     └── Checkout ────────► Confirmation Gate
```

### Strict Tool Router

The LLM does **not directly manipulate the database or application state**.

Instead:

```text
LLM
 │
 ▼
Tool Selection
 │
 ▼
Pydantic Validation
 │
 ▼
Tool Router
 │
 ▼
Application Service
 │
 ▼
Database / Cart / Browser
```

This provides a controlled boundary between the language model and application logic.

---

## 🧠 Conversational Memory

Koe.AI maintains session context using **Redis**.

The agent can incrementally merge information across multiple turns.

Example:

```text
User:
"Show me men's shirts."

Agent:
"Sure. What color are you looking for?"

User:
"Black."

Agent:
"Any particular budget?"

User:
"Under $50."
```

The agent maintains the accumulated state:

```json
{
  "category": "shirts",
  "gender": "men",
  "color": "black",
  "max_price": 50
}
```

This avoids repeatedly asking the user for information they have already provided.

---

# 📚 RAG for Store Knowledge

Koe.AI separates **structured product queries** from **unstructured store knowledge**.

### Product Data

Structured product information is handled through database queries and tools.

### Store Knowledge

Policies and FAQs are handled through RAG:

```text
Store Policies / FAQs
        │
        ▼
    Embeddings
        │
        ▼
   PostgreSQL
   + pgvector
        │
        ▼
    Retriever
        │
        ▼
  Policy Response
```

Typical questions include:

* "What's your return policy?"
* "Can I exchange this shirt?"
* "How long does delivery take?"
* "Do you offer cash on delivery?"

---

# 🎙️ Voice Interaction

Koe.AI supports two voice interaction modes.

## Push-To-Talk

```text
Microphone
    │
    ▼
Audio Capture
    │
    ▼
Speech-to-Text
    │
    ▼
LangGraph Agent
    │
    ▼
Text-to-Speech
    │
    ▼
Audio Response
```

## Real-Time Streaming

The streaming architecture uses WebSockets for low-latency interaction.

```text
User Audio
    │
    ▼
WebSocket
    │
    ▼
Streaming STT
    │
    ▼
LangGraph
    │
    ▼
Streaming LLM
    │
    ▼
Streaming TTS
    │
    ▼
User Audio
```

The architecture is designed to support:

* Streaming transcription
* Streaming LLM responses
* Streaming audio generation
* Low-latency interaction
* Conversation interruption / barge-in

---

# 🌐 Browser Automation Fallback

When a website does not expose the required APIs, Koe.AI can use **Playwright** as a browser automation fallback.

The browser agent can:

* Inspect page state
* Navigate pages
* Locate UI elements
* Apply filters
* Interact with product pages
* Recover from basic selector/layout changes

Architecture:

```text
Agent
  │
  ▼
Browser Tool
  │
  ▼
Playwright
  │
  ▼
Website DOM
  │
  ▼
Page State
  │
  ▼
Agent
```

This allows the system to potentially operate on external storefronts where direct API integration is unavailable.

---

# 🔐 Safe Checkout

Checkout actions are treated differently from normal information retrieval.

Before an order can be placed, the agent enters a confirmation state.

```text
Add Products
     │
     ▼
View Cart
     │
     ▼
Start Checkout
     │
     ▼
Order Summary
     │
     ▼
Human Confirmation
     │
     ├── Confirm ──► Place Order
     │
     └── Cancel ───► Stop
```

This human-in-the-loop architecture helps prevent accidental purchases caused by incorrect model interpretation.

---

# 📊 Observability & Evaluation

Koe.AI integrates **Langfuse** for tracing and diagnostics.

Tracked components include:

* LLM calls
* Token usage
* Tool selection
* Tool execution
* Agent execution paths
* STT latency
* LLM latency
* Tool latency
* TTS latency

### Evaluation

The project also includes automated evaluation for:

* Tool-selection accuracy
* Agent execution
* Conversation completion
* Regression testing
* Multi-turn behavior

---

# 🛠️ Tech Stack

| Layer                  | Technologies                                |
| ---------------------- | ------------------------------------------- |
| **Frontend**           | Next.js 14, React, Tailwind CSS             |
| **Backend**            | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| **Agent**              | LangGraph, LangChain                        |
| **Database**           | PostgreSQL 16+, pgvector                    |
| **Session / Cache**    | Redis 7+                                    |
| **Speech**             | Whisper, Deepgram, ElevenLabs               |
| **Browser Automation** | Playwright                                  |
| **Observability**      | Langfuse                                    |
| **Testing**            | Pytest                                      |
| **Containerization**   | Docker, Docker Compose                      |

---

# 📂 Repository Structure

```text
Koe.AI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── # FastAPI routes and endpoints
│   │   │
│   │   ├── core/
│   │   │   └── # Configuration, security, DB connections
│   │   │
│   │   ├── db/
│   │   │   └── # Models, database logic, seed scripts
│   │   │
│   │   ├── services/
│   │   │   └── # Catalog, cart and order services
│   │   │
│   │   ├── agent/
│   │   │   └── # LangGraph graph, state and prompts
│   │   │
│   │   ├── rag/
│   │   │   └── # Embeddings, retrievers and pgvector
│   │   │
│   │   ├── voice/
│   │   │   └── # STT/TTS provider implementations
│   │   │
│   │   └── browser/
│   │       └── # Playwright browser agent
│   │
│   ├── alembic/
│   │   └── # Database migrations
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── # Agent tests
│   │
│   ├── Dockerfile
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── # Next.js App Router
│   │   │
│   │   ├── components/
│   │   │   └── # UI components
│   │   │
│   │   ├── hooks/
│   │   │   └── # Voice and WebSocket hooks
│   │   │
│   │   └── lib/
│   │       └── # API clients and utilities
│   │
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── evaluation/
│   ├── datasets/
│   ├── test_agent_evals.py
│   └── # Agent evaluation benchmarks
│
├── docker/
│   └── # Database and infrastructure setup
│
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Docker
* Docker Compose
* Python 3.11+
* Node.js 18+
* npm or pnpm

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/koe-ai.git
cd koe-ai
```

---

## 2. Configure Environment Variables

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Create the frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

Example backend configuration:

```env
# Database
DATABASE_URL=postgresql+asyncpg://agent:password@localhost:5432/shopping_db

# Redis
REDIS_URL=redis://localhost:6379/0

# LLM
OPENAI_API_KEY=your_openai_api_key

# Voice Providers
ELEVENLABS_API_KEY=your_elevenlabs_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key

# Langfuse
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com
```

> **Never commit `.env` files or API keys to GitHub.**

---

## 3. Start the Application

Run the complete stack using Docker Compose:

```bash
docker compose up --build
```

The main services should then be available at:

| Service           | URL                        |
| ----------------- | -------------------------- |
| Frontend          | http://localhost:3000      |
| FastAPI           | http://localhost:8000      |
| API Documentation | http://localhost:8000/docs |

If Langfuse is self-hosted, its URL depends on your Docker Compose configuration.

---

## 4. Seed the Database

Populate the database with sample products and categories:

```bash
docker compose exec backend python -m app.db.seed
```

The seed process can generate a realistic product catalog for development and testing.

---

# 🛠️ Agent Tools

Koe.AI uses structured, Pydantic-validated tools.

| Tool                  | Parameters                                                  | Purpose                                 |
| --------------------- | ----------------------------------------------------------- | --------------------------------------- |
| `search_products`     | `query`, `category`, `gender`, `max_price`, `color`, `size` | Search and filter products              |
| `open_category`       | `category`, `gender`                                        | Navigate to a category                  |
| `apply_filter`        | `filter_name`, `filter_value`                               | Refine current results                  |
| `get_product_details` | `product_id`                                                | Retrieve product information            |
| `add_to_cart`         | `product_id`, `variant_id`, `quantity`                      | Add a product to the cart               |
| `view_cart`           | None                                                        | Retrieve current cart                   |
| `retrieve_store_info` | `query`                                                     | Search store policies using RAG         |
| `start_checkout`      | None                                                        | Start checkout and request confirmation |

---

# 🧪 Testing

## Unit & Integration Tests

```bash
docker compose exec backend pytest tests/unit tests/integration
```

## Agent Evaluation

```bash
docker compose exec backend pytest evaluation/test_agent_evals.py
```

The evaluation suite is designed to measure agent behavior such as tool selection, execution correctness, and conversation completion.

---

# 🛣️ Development Roadmap

| Phase  | Focus           | Deliverables                                  |
| ------ | --------------- | --------------------------------------------- |
| **0**  | Infrastructure  | Docker, PostgreSQL, Redis, Next.js, FastAPI   |
| **1**  | E-Commerce Core | Product database, REST APIs, catalog and cart |
| **2**  | Text Agent      | LLM tool loop and basic shopping tools        |
| **3**  | Agent Expansion | Tool router and Pydantic validation           |
| **4**  | Memory          | Redis session state and multi-turn context    |
| **5**  | RAG             | Store policy and FAQ retrieval                |
| **6**  | Push-to-Talk    | Audio capture and STT/TTS                     |
| **7**  | Real-Time Voice | Streaming STT, LLM, TTS and WebSockets        |
| **8**  | Browser Agent   | Playwright-based navigation                   |
| **9**  | Safe Checkout   | Human confirmation workflow                   |
| **10** | Observability   | Langfuse tracing and automated evaluations    |

---

# 🎯 Project Goals

The long-term goal of Koe.AI is to move e-commerce interaction from:

```text
Traditional E-Commerce

Search → Filter → Browse → Product Page → Cart → Checkout
```

towards:

```text
Agentic E-Commerce

Customer
   │
   ▼
Natural Conversation
   │
   ▼
AI Shopping Assistant
   │
   ├── Understand Intent
   ├── Search Products
   ├── Ask Clarifying Questions
   ├── Remember Preferences
   ├── Navigate Store
   ├── Manage Cart
   ├── Answer Store Questions
   └── Guide Checkout
```

The objective is to make shopping feel more like **talking to a personal sales assistant** than operating a traditional e-commerce website.

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

If you would like to contribute:

```bash
git checkout -b feature/your-feature
```

Make your changes, add tests where appropriate, and open a pull request.

---

# 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for details.

---

# 👨‍💻 Author

**Muhammad Ahsan**

AI Engineer | Generative AI | Agentic AI | LLM Applications

---

⭐ If you find **Koe.AI** interesting, consider giving the repository a star.
