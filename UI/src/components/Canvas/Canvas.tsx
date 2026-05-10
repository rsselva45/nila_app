import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  BackgroundVariant,
} from 'reactflow';
import type { Node } from 'reactflow';
import 'reactflow/dist/style.css';

import { useStore } from '../../store/useStore';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { SectionNode } from './nodes/SectionNode';
import { GroupNode } from './nodes/GroupNode';
import type { SectionNodeData, GroupNodeData } from '../../types';
import styles from './Canvas.module.css';

const nodeTypes = {
  startNode: StartNode,
  endNode: EndNode,
  sectionNode: SectionNode,
  groupNode: GroupNode,
};

let nodeIdCounter = 100;
const generateId = () => `node-${++nodeIdCounter}`;

function CanvasInner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    setSelectedEdgeId,
    addNode,
  } = useStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!wrapperRef.current) return;

      const nodeType = event.dataTransfer.getData('application/nila-node-type') as
        | 'sectionNode'
        | 'groupNode';
      if (!nodeType) return;

      const bounds = wrapperRef.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      if (nodeType === 'groupNode') {
        const newNode: Node<GroupNodeData> = {
          id: generateId(),
          type: 'groupNode',
          position,
          style: { width: 630, height: 195, zIndex: -1 },
          data: {
            label: 'New Group',
            nodeType: 'groupNode',
            description: 'Define conditions for each section inside',
          },
        };
        addNode(newNode as Node<SectionNodeData | GroupNodeData>);
      } else {
        const newNode: Node<SectionNodeData> = {
          id: generateId(),
          type: 'sectionNode',
          position,
          data: {
            label: 'New Section',
            nodeType: 'sectionNode',
            questions: 0,
            durationMinutes: 0,
          },
        };
        addNode(newNode as Node<SectionNodeData | GroupNodeData>);
      }
    },
    [project, addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      setSelectedEdgeId(edge.id);
    },
    [setSelectedEdgeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [setSelectedNodeId, setSelectedEdgeId]);

  return (
    <div ref={wrapperRef} className={styles.canvasWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#cbd5e1" />
        <Controls
          className={styles.controls}
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'startNode') return '#10b981';
            if (node.type === 'endNode') return '#475569';
            if (node.type === 'groupNode') return '#7c3aed';
            return '#3b82f6';
          }}
          className={styles.minimap}
          maskColor="rgba(241,245,249,0.7)"
        />
      </ReactFlow>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
