import type { Node, Edge } from 'reactflow';
import type { SectionNodeData, GroupNodeData, ComponentItem } from '../types';

export const availableComponents: ComponentItem[] = [
  {
    id: 'cmp-assess-math-1',
    title: 'Math Module 1 Assessment',
    shortDescription: 'Baseline math diagnostic used to route learners.',
    type: 'assessment',
    approximateDurationMinutes: 35,
    metadata: { assessment: { maxScore: 100, passingScore: 50 } },
  },
  {
    id: 'cmp-unit-math-2-easy',
    title: 'Math Module 2 – Easy',
    shortDescription: 'Foundational math remediation unit.',
    type: 'unit',
    approximateDurationMinutes: 35,
    metadata: { unit: { recommendedMinutes: 30 } },
  },
  {
    id: 'cmp-assess-math-2-adv',
    title: 'Math Module 2 – Advanced',
    shortDescription: 'Advanced math enrichment for high scorers.',
    type: 'assessment',
    approximateDurationMinutes: 35,
    metadata: { assessment: { maxScore: 100, passingScore: 70 } },
  },
  {
    id: 'cmp-unit-rc-1',
    title: 'Reading & Comp Module 1',
    shortDescription: 'Core reading comprehension diagnostic.',
    type: 'assessment',
    approximateDurationMinutes: 32,
    metadata: { assessment: { maxScore: 100, passingScore: 50 } },
  },
  {
    id: 'cmp-unit-rc-2-easy',
    title: 'R&C Module 2 – Easy',
    shortDescription: 'Foundational reading comprehension unit.',
    type: 'unit',
    approximateDurationMinutes: 32,
    metadata: { unit: { recommendedMinutes: 27 } },
  },
];

export const initialNodes: Node<SectionNodeData | GroupNodeData>[] = [
  {
    id: 'start',
    type: 'startNode',
    position: { x: 290, y: 0 },
    data: { label: 'Start Assessment', nodeType: 'startNode' },
  },
  {
    id: 'math-1',
    type: 'sectionNode',
    position: { x: 258, y: 145 },
    data: {
      label: 'Math Module 1',
      nodeType: 'sectionNode',
      questions: 22,
      durationMinutes: 35,
      componentType: 'assessment',
      componentId: 'cmp-assess-math-1',
    },
  },
  // Group node for Math Module 2 – acts as visual container
  {
    id: 'group-math-2',
    type: 'groupNode',
    position: { x: 65, y: 285 },
    style: { width: 630, height: 195, zIndex: -1 },
    data: {
      label: 'Math Module 2',
      nodeType: 'groupNode',
      description: 'Adaptive based on Module 1 performance',
    },
  },
  {
    id: 'math-2-easy',
    type: 'sectionNode',
    parentNode: 'group-math-2',
    extent: 'parent',
    position: { x: 15, y: 65 },
    data: {
      label: 'Math Module 2 – Easy',
      nodeType: 'sectionNode',
      questions: 22,
      durationMinutes: 35,
      componentType: 'unit',
      componentId: 'cmp-unit-math-2-easy',
      parentGroupId: 'group-math-2',
      conditions: [
        {
          id: 'cond-math-2-easy-1',
          sourceNodeId: 'math-1',
          metric: 'score',
          operator: 'lte',
          value: 50,
        },
      ],
    },
  },
  {
    id: 'math-2-advanced',
    type: 'sectionNode',
    parentNode: 'group-math-2',
    extent: 'parent',
    position: { x: 370, y: 65 },
    data: {
      label: 'Math Module 2 – Advanced',
      nodeType: 'sectionNode',
      questions: 22,
      durationMinutes: 35,
      componentType: 'assessment',
      componentId: 'cmp-assess-math-2-adv',
      parentGroupId: 'group-math-2',
      conditions: [
        {
          id: 'cond-math-2-adv-1',
          sourceNodeId: 'math-1',
          metric: 'score',
          operator: 'gte',
          value: 50,
        },
      ],
    },
  },
  {
    id: 'rc-1',
    type: 'sectionNode',
    position: { x: 258, y: 560 },
    data: {
      label: 'Reading & Comp Module 1',
      nodeType: 'sectionNode',
      questions: 27,
      durationMinutes: 32,
      componentType: 'assessment',
      componentId: 'cmp-unit-rc-1',
    },
  },
  // Group node for R&C Module 2
  {
    id: 'group-rc-2',
    type: 'groupNode',
    position: { x: 65, y: 700 },
    style: { width: 630, height: 195, zIndex: -1 },
    data: {
      label: 'Reading & Comp Module 2',
      nodeType: 'groupNode',
      description: 'Adaptive based on Module 1 performance',
    },
  },
  {
    id: 'rc-2-easy',
    type: 'sectionNode',
    parentNode: 'group-rc-2',
    extent: 'parent',
    position: { x: 15, y: 65 },
    data: {
      label: 'R&C Module 2 – Easy',
      nodeType: 'sectionNode',
      questions: 27,
      durationMinutes: 32,
      componentType: 'unit',
      componentId: 'cmp-unit-rc-2-easy',
      parentGroupId: 'group-rc-2',
      conditions: [
        {
          id: 'cond-rc-2-easy-1',
          sourceNodeId: 'rc-1',
          metric: 'score',
          operator: 'lte',
          value: 50,
        },
      ],
    },
  },
  {
    id: 'rc-2-advanced',
    type: 'sectionNode',
    parentNode: 'group-rc-2',
    extent: 'parent',
    position: { x: 370, y: 65 },
    data: {
      label: 'R&C Module 2 – Advanced',
      nodeType: 'sectionNode',
      questions: 27,
      durationMinutes: 32,
      componentType: 'assessment',
      parentGroupId: 'group-rc-2',
      conditions: [
        {
          id: 'cond-rc-2-adv-1',
          sourceNodeId: 'rc-1',
          metric: 'score',
          operator: 'gte',
          value: 50,
        },
      ],
    },
  },
  {
    id: 'end',
    type: 'endNode',
    position: { x: 290, y: 970 },
    data: { label: 'Complete Assessment', nodeType: 'endNode' },
  },
];

export const initialEdges: Edge[] = [
  { id: 'e-start-math1', source: 'start', target: 'math-1', type: 'smoothstep', animated: true },
  { id: 'e-math1-group', source: 'math-1', target: 'group-math-2', type: 'smoothstep', animated: true },
  { id: 'e-easy-rc1', source: 'math-2-easy', target: 'rc-1', type: 'smoothstep', animated: true },
  { id: 'e-adv-rc1', source: 'math-2-advanced', target: 'rc-1', type: 'smoothstep', animated: true },
  { id: 'e-rc1-group', source: 'rc-1', target: 'group-rc-2', type: 'smoothstep', animated: true },
  { id: 'e-rc2easy-end', source: 'rc-2-easy', target: 'end', type: 'smoothstep', animated: true },
  { id: 'e-rc2adv-end', source: 'rc-2-advanced', target: 'end', type: 'smoothstep', animated: true },
];
