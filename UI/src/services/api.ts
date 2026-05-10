import type { Node, Edge } from 'reactflow';
import type { SectionNodeData, GroupNodeData } from '../types';

const BASE_URL = 'http://localhost:8080/api';

// ── API shape types ──────────────────────────────────────────────────────────

export interface ApiComponent {
  id: string;
  title: string;
  shortDescription: string;
  type: 'unit' | 'assessment';
  approximateDurationMinutes: number;
  metadata?: {
    assessment?: { maxScore: number; passingScore: number };
    unit?: { recommendedMinutes?: number };
  };
}

export interface ApiAvailableContent {
  items: ApiComponent[];
  totalCount: number;
}

export interface ApiNodeConfig {
  approximateDurationMinutes?: number;
  assessment?: { maxScore: number; passingScore: number };
}

export interface ApiNode {
  id: string;
  componentId?: string;
  type: 'start' | 'unit' | 'assessment' | 'end' | 'group';
  label: string;
  description?: string;
  position: { x: number; y: number };
  config?: ApiNodeConfig;
}

export interface ApiEdgeRule {
  id: string;
  sourceType: 'assessment' | 'unit';
  sourceNodeId: string;
  metric: string;
  operator: string;
  value?: number | boolean | string;
}

export interface ApiEdgeConditions {
  operator: 'AND' | 'OR';
  rules: ApiEdgeRule[];
}

export interface ApiEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  priority?: number;
  isDefault?: boolean;
  conditions: ApiEdgeConditions;
}

export interface ApiLearningPath {
  id?: string;
  name: string;
  description?: string;
  status: 'draft' | 'published';
  version?: number;
  nodes: ApiNode[];
  edges: ApiEdge[];
}

// ── Canvas → API mapping ─────────────────────────────────────────────────────

type AnyNodeData = SectionNodeData | GroupNodeData;

function mapToApiNode(node: Node<AnyNodeData>): ApiNode {
  const { id, position } = node;
  const rfType = node.type;
  const data = node.data;

  if (rfType === 'startNode') {
    return { id, componentId: 'system:start', type: 'start', label: data.label, position };
  }
  if (rfType === 'endNode') {
    return { id, componentId: 'system:end', type: 'end', label: data.label, position };
  }
  if (rfType === 'groupNode') {
    return { id, type: 'group', label: data.label, description: (data as GroupNodeData).description, position };
  }
  // sectionNode
  const sdata = data as SectionNodeData;
  return {
    id,
    componentId: sdata.componentId,
    type: sdata.componentType ?? 'unit',
    label: sdata.label,
    description: sdata.description,
    position,
    config: sdata.durationMinutes != null ? { approximateDurationMinutes: sdata.durationMinutes } : undefined,
  };
}

function mapToApiEdge(edge: Edge, nodes: Node<AnyNodeData>[]): ApiEdge {
  const targetNode = nodes.find((n) => n.id === edge.target);
  const rules: ApiEdgeRule[] = [];

  if (targetNode && 'conditions' in targetNode.data) {
    const sdata = targetNode.data as SectionNodeData;
    for (const cond of sdata.conditions ?? []) {
      const srcNode = nodes.find((n) => n.id === cond.sourceNodeId);
      const sourceType =
        ((srcNode?.data as SectionNodeData)?.componentType as 'assessment' | 'unit') ?? 'assessment';
      rules.push({
        id: cond.id,
        sourceType,
        sourceNodeId: cond.sourceNodeId,
        metric: cond.metric,
        operator: cond.operator,
        value: cond.value,
      });
    }
  }

  return {
    id: edge.id,
    sourceNodeId: edge.source,
    targetNodeId: edge.target,
    priority: 1,
    isDefault: false,
    conditions: { operator: 'AND', rules },
  };
}

export function buildLearningPathPayload(
  name: string,
  status: 'draft' | 'published',
  nodes: Node<AnyNodeData>[],
  edges: Edge[],
  existingId?: string,
): ApiLearningPath {
  return {
    id: existingId,
    name,
    status,
    nodes: nodes.map(mapToApiNode),
    edges: edges.map((e) => mapToApiEdge(e, nodes)),
  };
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchComponents(): Promise<ApiComponent[]> {
  const data = await request<ApiAvailableContent>('/components');
  return data.items;
}

export async function saveLearningPath(payload: ApiLearningPath): Promise<ApiLearningPath> {
  return request<ApiLearningPath>('/learning-paths', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getLearningPath(id: string): Promise<ApiLearningPath> {
  return request<ApiLearningPath>(`/learning-paths/${id}`);
}
