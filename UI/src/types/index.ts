export type ComponentType = 'unit' | 'assessment';
export type CanvasNodeType = 'startNode' | 'endNode' | 'sectionNode' | 'groupNode';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'adaptive';
export type ConditionMetric =
  | 'completion'
  | 'passed'
  | 'score'
  | 'score_range'
  | 'time_spent_minutes'
  | 'percentage_completion';
export type ConditionOperator = 'eq' | 'gte' | 'lte' | 'between';

export interface NodeCondition {
  id: string;
  sourceNodeId: string;
  metric: ConditionMetric;
  operator: ConditionOperator;
  value: number;
  valueMax?: number;
}

export interface SectionNodeData {
  label: string;
  nodeType: CanvasNodeType;
  description?: string;
  questions?: number;
  durationMinutes?: number;
  difficulty?: Difficulty;
  componentId?: string;
  componentType?: ComponentType;
  conditions?: NodeCondition[];
  parentGroupId?: string;
}

export interface GroupNodeData {
  label: string;
  nodeType: 'groupNode';
  description?: string;
}

export interface ComponentItem {
  id: string;
  title: string;
  shortDescription: string;
  type: ComponentType;
  approximateDurationMinutes: number;
  metadata?: {
    assessment?: { maxScore: number; passingScore: number };
    unit?: { recommendedMinutes?: number };
  };
}
