# Nila – Adaptive Learning Path Builder (UI)

A React single-page application for visually designing adaptive, conditional quiz flows. Educators drag sections and groups onto a canvas, connect them with edges, and set score-based routing conditions — all before saving to the backend API.

---

## Tech Stack

| Layer | Library / Tool | Version |
|-------|---------------|---------|
| Framework | React | 19 |
| Build tool | Vite | 8 |
| Type system | TypeScript | 6 |
| Canvas / graph | **React Flow** (`reactflow`) | 11 |
| Global state | **Zustand** | 5 |
| Icons | Lucide React | 1 |
| Styles | CSS Modules | — |
| HTTP | Fetch API (native) | — |

---

## Library Choices

### React Flow (`reactflow`) — graph & drag-and-drop

React Flow was chosen as the graph/DnD foundation for these reasons:

- **Mature and purpose-built.** It is the most widely used React graph library (>22 k GitHub stars), with active maintenance, comprehensive docs, and TypeScript types included.
- **Custom node types.** Each node type (`startNode`, `endNode`, `sectionNode`, `groupNode`) is a plain React component, giving full control over appearance and internal interaction without fighting abstractions.
- **Parent-node containment.** React Flow's built-in `parentNode` + `extent: 'parent'` system lets child section nodes snap and stay inside a group container — this implements the adaptive-group visual pattern without any custom collision logic.
- **HTML5 drag-and-drop integration.** The left panel uses native `draggable` + `dataTransfer` events. React Flow's `onDrop` / `onDragOver` + `useReactFlow().project()` converts screen coordinates to canvas coordinates, so no additional DnD library is needed.
- **Built-ins included.** `<Background>` (dot grid), `<Controls>` (zoom/fit), and `<MiniMap>` are shipped in the package, saving integration effort.

Alternative libraries considered and ruled out:

| Library | Reason not chosen |
|---------|-------------------|
| `react-dnd` | Great general-purpose DnD, but adds a separate abstraction layer that doesn't integrate cleanly with React Flow's own coordinate system. |
| `@dnd-kit/core` | Same concern — designed for list/sortable UIs rather than free-canvas placement. |
| `xyflow` / `@xyflow/react` | This is the v12+ rename of React Flow. v11 (`reactflow`) was chosen for stability at project start. |
| `vis-network`, `d3-force` | No React-native node editing; would require building the entire interaction layer from scratch. |

### Zustand — global state

Zustand manages all canvas state (nodes, edges, selection, save status). Chosen because:

- Zero boilerplate — no reducers, no context providers.
- Works naturally with React Flow: `useStore()` returns `nodes` and the change handlers (`onNodesChange`, `onEdgesChange`) that React Flow expects directly.
- Small bundle impact (~1 kB gzipped).

Redux was not chosen because the state shape is simple and local — no server-state synchronization, no need for time-travel debugging.

---

## Project Structure

```
UI/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── Canvas.tsx          # ReactFlow wrapper + DnD drop handler
│   │   │   ├── Canvas.module.css
│   │   │   └── nodes/
│   │   │       ├── StartNode.tsx   # Green start pill
│   │   │       ├── EndNode.tsx     # Dark end pill
│   │   │       ├── SectionNode.tsx # Blue card with metadata badges
│   │   │       ├── GroupNode.tsx   # Dashed purple container
│   │   │       └── nodes.module.css
│   │   ├── Header/
│   │   │   ├── Header.tsx          # Name input + Save Draft / Publish
│   │   │   └── Header.module.css
│   │   ├── LeftPanel/
│   │   │   ├── LeftPanel.tsx       # Draggable canvas items + API components
│   │   │   └── LeftPanel.module.css
│   │   └── PropertiesPanel/
│   │       ├── PropertiesPanel.tsx # Node/edge editor + condition builder
│   │       └── PropertiesPanel.module.css
│   ├── data/
│   │   └── initialData.ts          # Pre-loaded SAT demo canvas
│   ├── services/
│   │   └── api.ts                  # Typed fetch wrappers + canvas→API mapper
│   ├── store/
│   │   └── useStore.ts             # Zustand store (nodes, edges, save state)
│   ├── types/
│   │   └── index.ts                # Shared TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Node Types

| React Flow type | Visual | Purpose |
|----------------|--------|---------|
| `startNode` | Green rounded pill | Entry point of the learning path |
| `endNode` | Dark slate pill | Exit / completion point |
| `sectionNode` | Blue card | A single quiz/assessment module; holds duration, question count, difficulty, and entry conditions |
| `groupNode` | Dashed purple container | Groups two or more `sectionNode` children; the system routes a learner into exactly one child based on conditions |

### Parent-node containment (groups)

Group nodes are created with `style: { width: 630, height: 195, zIndex: -1 }`. Child section nodes reference the group via `parentNode: '<group-id>'` and `extent: 'parent'`, which keeps them inside the group boundary during drag.

---

## State Model

All canvas state lives in the Zustand store (`useStore`):

```ts
interface AppState {
  nodes: Node<SectionNodeData | GroupNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  learningPathId: string | null;   // ID returned by the API after first save
  learningPathName: string;        // Editable in the header
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;
}
```

Conditions (entry rules for a section node) are stored on the **node**, not the edge. When saving, `buildLearningPathPayload()` in `api.ts` maps them onto their incoming edges as `EdgeDto.ConditionsDto.rules`, matching the backend schema.

---

## API Integration

The service layer lives in `src/services/api.ts`. It talks to the Spring Boot backend at `http://localhost:8080/api`.

| Function | HTTP | Endpoint |
|----------|------|----------|
| `fetchComponents()` | GET | `/api/components` |
| `saveLearningPath(payload)` | POST | `/api/learning-paths` |
| `getLearningPath(id)` | GET | `/api/learning-paths/{id}` |

`buildLearningPathPayload(name, status, nodes, edges, existingId?)` converts the React Flow canvas into the backend DTO:

- `startNode` → `{ type: 'start', componentId: 'system:start' }`
- `endNode` → `{ type: 'end', componentId: 'system:end' }`
- `sectionNode` → `{ type: data.componentType, componentId: data.componentId }`
- `groupNode` → `{ type: 'group' }` (no componentId)
- Each edge carries the target node's conditions as typed `rules[]`

---

## Getting Started

**Prerequisites:** Node.js 18+ and the [API](../API/README.md) running on port 8080.

```bash
cd UI
npm install
npm run dev          # http://localhost:5173
```

### Build for production

```bash
npm run build        # output in dist/
npm run preview      # preview the production build locally
```

### Lint

```bash
npm run lint
```

---

## Environment

The API base URL is hard-coded in `src/services/api.ts`:

```ts
const BASE_URL = 'http://localhost:8080/api';
```

To point at a different host, update that constant (or extract it to a `.env` variable using `import.meta.env.VITE_API_URL`).

---

## Key Design Decisions

- **No separate DnD library.** React Flow's `onDrop` + native `dataTransfer` covers all drag-from-panel use cases. Adding `react-dnd` would introduce a second coordinate system with no benefit.
- **CSS Modules over Tailwind/styled-components.** Scoped, zero-runtime, co-located with each component — appropriate for a UI of this size.
- **Conditions on nodes, not edges.** The properties panel shows "entry conditions" on the destination section. The mapper layer converts them to edge rules at save time, keeping the editing UX intuitive.
- **`verbatimModuleSyntax` enabled.** TypeScript 6 / Vite 8 require `import type` for type-only imports. All type imports are split from value imports accordingly.
