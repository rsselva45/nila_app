# Nila – Adaptive Learning Path Builder

A full-stack web application for designing adaptive, score-based quiz flows. Educators build learning paths visually on a node-graph canvas; the system automatically routes learners to different content based on their performance.

```
nila_app/
├── UI/    React + Vite + TypeScript frontend
└── API/   Spring Boot 3 + SQLite backend
```

---

## Architecture Overview

```
┌─────────────────────────────────────┐      HTTP / JSON
│  Browser (React SPA)                │ ──────────────────▶  Spring Boot API
│                                     │                        port 8080
│  ┌──────────┐  ┌────────┐  ┌──────┐│       GET /api/components
│  │Left Panel│  │Canvas  │  │Props ││       POST /api/learning-paths
│  │(content) │  │(graph) │  │Panel ││       GET  /api/learning-paths/{id}
│  └──────────┘  └────────┘  └──────┘│                              │
│         Zustand store               │                       SQLite file
└─────────────────────────────────────┘                        nila.db
        port 5173
```

The UI fetches available content components from the API on load. When the user clicks **Save Draft** or **Publish**, the current canvas (nodes + edges + conditions) is serialized and POSTed to the API for persistence.

---

## Quick Start

**Prerequisites:** Node.js 18+, Java 21, Maven 3.9+.

### 1. Start the API

```bash
cd API
mvn spring-boot:run
# → http://localhost:8080
```

The SQLite database (`API/data/nila.db`) and schema are created automatically on first boot. 9 sample content components are seeded.

### 2. Start the UI

```bash
cd UI
npm install
npm run dev
# → http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## Features

- **Visual graph canvas** — drag-and-drop section and group nodes, draw edges between them
- **Adaptive routing** — set score-based entry conditions (e.g. "show Easy version if Math 1 score ≤ 50")
- **Group containers** — visually group two or more sections; learners are routed into exactly one
- **Properties panel** — edit node label, duration, difficulty, and conditions; inspect edge connections
- **Available content sidebar** — live list of content components fetched from the API, draggable onto the canvas
- **Save Draft / Publish** — persists the full learning path graph to SQLite; the editable name in the header is saved with it

---

## Detailed Documentation

| Module | README |
|--------|--------|
| Frontend | [UI/README.md](UI/README.md) — library choices, component structure, state model, API integration |
| Backend | [API/README.md](API/README.md) — endpoints, data model, seed data, configuration, tests |

---

## Repository Layout

```
nila_app/
├── README.md                   ← this file
│
├── UI/                         ← React SPA
│   ├── src/
│   │   ├── components/         ← Canvas, Header, LeftPanel, PropertiesPanel
│   │   ├── services/api.ts     ← Typed fetch wrappers + canvas→DTO mapper
│   │   ├── store/useStore.ts   ← Zustand global state
│   │   ├── types/index.ts      ← Shared TypeScript types
│   │   └── data/initialData.ts ← Pre-loaded SAT demo canvas
│   ├── package.json
│   └── README.md
│
└── API/                        ← Spring Boot microservice
    ├── src/
    │   ├── main/java/…         ← Controllers, services, entities, DTOs
    │   └── test/java/…         ← 18 JUnit 5 / MockMvc tests
    ├── data/nila.db            ← SQLite file (created at runtime)
    ├── pom.xml
    └── README.md
```
