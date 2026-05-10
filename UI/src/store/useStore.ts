import { create } from 'zustand';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import { initialNodes, initialEdges } from '../data/initialData';
import type { SectionNodeData, GroupNodeData, NodeCondition } from '../types';

type AnyNodeData = SectionNodeData | GroupNodeData;

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AppState {
  nodes: Node<AnyNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;

  learningPathId: string | null;
  learningPathName: string;
  saveStatus: SaveStatus;
  saveError: string | null;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;

  addNode: (node: Node<AnyNodeData>) => void;
  updateNodeData: (id: string, data: Partial<SectionNodeData>) => void;
  updateNodeCondition: (nodeId: string, condition: NodeCondition) => void;
  removeNodeCondition: (nodeId: string, conditionId: string) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (id: string) => void;

  setLearningPathName: (name: string) => void;
  setSaveStatus: (status: SaveStatus, error?: string | null) => void;
  setLearningPathId: (id: string) => void;
}

export const useStore = create<AppState>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  selectedEdgeId: null,

  learningPathId: null,
  learningPathName: 'SAT Adaptive Learning Path',
  saveStatus: 'idle',
  saveError: null,

  setLearningPathName: (name) => set({ learningPathName: name }),
  setSaveStatus: (status, error = null) => set({ saveStatus: status, saveError: error }),
  setLearningPathId: (id) => set({ learningPathId: id }),

  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) as Node<AnyNodeData>[] })),

  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: (connection) =>
    set((state) => ({
      edges: addEdge({ ...connection, type: 'smoothstep', animated: true }, state.edges),
    })),

  setSelectedNodeId: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdgeId: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

  updateNodeData: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } } : n
      ),
    })),

  updateNodeCondition: (nodeId, condition) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const d = n.data as SectionNodeData;
        const existing = d.conditions ?? [];
        const idx = existing.findIndex((c) => c.id === condition.id);
        const updated =
          idx >= 0
            ? existing.map((c) => (c.id === condition.id ? condition : c))
            : [...existing, condition];
        return { ...n, data: { ...d, conditions: updated } };
      }),
    })),

  removeNodeCondition: (nodeId, conditionId) =>
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const d = n.data as SectionNodeData;
        return {
          ...n,
          data: { ...d, conditions: (d.conditions ?? []).filter((c) => c.id !== conditionId) },
        };
      }),
    })),

  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id && (n as Node & { parentNode?: string }).parentNode !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  deleteEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    })),
}));
