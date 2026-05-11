import { useMemo } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { SectionNodeData, GroupNodeData, NodeCondition, ConditionMetric, ConditionOperator, Difficulty } from '../../types';
import styles from './PropertiesPanel.module.css';

const METRIC_OPTIONS: { value: ConditionMetric; label: string }[] = [
  { value: 'score', label: 'Score' },
  { value: 'score_range', label: 'Score Range' },
  { value: 'passed', label: 'Passed' },
  { value: 'completion', label: 'Completion' },
  { value: 'percentage_completion', label: '% Completion' },
  { value: 'time_spent_minutes', label: 'Time Spent (min)' },
];

const OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: 'lte', label: 'Less than (<)' },
  { value: 'gte', label: 'Greater or equal (≥)' },
  { value: 'eq', label: 'Equal to (=)' },
  { value: 'between', label: 'Between' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'adaptive', label: 'Adaptive' },
];

interface PropertiesPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function PropertiesPanel({ isOpen = false, onClose }: PropertiesPanelProps) {
  const {
    nodes,
    edges,
    selectedNodeId,
    selectedEdgeId,
    updateNodeData,
    updateNodeCondition,
    removeNodeCondition,
    deleteNode,
    deleteEdge,
    setSelectedNodeId,
  } = useStore();

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId]
  );

  // Build label map for source section dropdown
  const nodeLabelMap = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, (n.data as SectionNodeData).label])),
    [nodes]
  );

  const panelClass = `${styles.panel} ${isOpen ? styles.panelOpen : ''}`;

  if (!selectedNode && !selectedEdge) {
    return (
      <aside className={panelClass}>
        <div className={styles.empty}>
          <p>Select a node or connection to view and edit its properties.</p>
        </div>
      </aside>
    );
  }

  if (selectedEdge) {
    return (
      <aside className={panelClass}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Properties</span>
          <button className={styles.deleteBtn} onClick={() => deleteEdge(selectedEdge.id)} title="Delete connection">
            <Trash2 size={15} />
          </button>
        </div>
        <div className={styles.badge}>Connection</div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>From</label>
          <div className={styles.readonlyValue}>{nodeLabelMap[selectedEdge.source] ?? selectedEdge.source}</div>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>To</label>
          <div className={styles.readonlyValue}>{nodeLabelMap[selectedEdge.target] ?? selectedEdge.target}</div>
        </div>
      </aside>
    );
  }

  if (!selectedNode) return null;

  const nodeData = selectedNode.data as SectionNodeData & GroupNodeData;
  const isGroup = selectedNode.type === 'groupNode';
  const isStart = selectedNode.type === 'startNode';
  const isEnd = selectedNode.type === 'endNode';
  const isSection = selectedNode.type === 'sectionNode';

  const parentGroup = nodeData.parentGroupId
    ? nodes.find((n) => n.id === nodeData.parentGroupId)
    : null;

  const addCondition = () => {
    const newCond: NodeCondition = {
      id: `cond-${Date.now()}`,
      sourceNodeId: '',
      metric: 'score',
      operator: 'lte',
      value: 50,
    };
    updateNodeCondition(selectedNode.id, newCond);
  };

  const conditions = (nodeData as SectionNodeData).conditions ?? [];

  return (
    <aside className={panelClass}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Properties</span>
        {!isStart && !isEnd && (
          <button
            className={styles.deleteBtn}
            onClick={() => {
              deleteNode(selectedNode.id);
              setSelectedNodeId(null);
            }}
            title="Delete node"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <div className={`${styles.badge} ${isGroup ? styles.badgeGroup : isStart ? styles.badgeStart : isEnd ? styles.badgeEnd : ''}`}>
        {isGroup ? 'Group' : isStart ? 'Start' : isEnd ? 'End' : 'Section'}
      </div>

      {/* Label */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Label</label>
        <input
          className={styles.input}
          value={nodeData.label ?? ''}
          onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
          placeholder="Enter label"
        />
      </div>

      {/* Description */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Description</label>
        <textarea
          className={styles.textarea}
          value={nodeData.description ?? ''}
          onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      {/* Section-specific fields */}
      {isSection && (
        <>
          <div className={styles.sectionTitle}>Section Details</div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Questions</label>
              <input
                type="number"
                className={styles.input}
                value={(nodeData as SectionNodeData).questions ?? 0}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { questions: Number(e.target.value) })
                }
                min={0}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Duration (min)</label>
              <input
                type="number"
                className={styles.input}
                value={(nodeData as SectionNodeData).durationMinutes ?? 0}
                onChange={(e) =>
                  updateNodeData(selectedNode.id, { durationMinutes: Number(e.target.value) })
                }
                min={0}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Difficulty</label>
            <select
              className={styles.select}
              value={(nodeData as SectionNodeData).difficulty ?? ''}
              onChange={(e) =>
                updateNodeData(selectedNode.id, { difficulty: e.target.value as Difficulty || undefined })
              }
            >
              <option value="">Select difficulty</option>
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Assignment Conditions */}
          <div className={styles.conditionsHeader}>
            <span className={styles.sectionTitle} style={{ marginBottom: 0 }}>Assignment Conditions</span>
            <button className={styles.addBtn} onClick={addCondition}>
              <Plus size={13} /> Add
            </button>
          </div>
          <p className={styles.conditionHint}>Define when this section should be shown to learners</p>

          {conditions.length === 0 && (
            <div className={styles.noConditions}>No conditions set. Click "+ Add" to define routing rules.</div>
          )}

          {conditions.map((cond, idx) => (
            <ConditionEditor
              key={cond.id}
              index={idx}
              condition={cond}
              nodeId={selectedNode.id}
              nodes={nodes.filter((n) => n.id !== selectedNode.id && n.type !== 'groupNode')}
              nodeLabelMap={nodeLabelMap}
              onUpdate={(c) => updateNodeCondition(selectedNode.id, c)}
              onRemove={() => removeNodeCondition(selectedNode.id, cond.id)}
            />
          ))}

          {/* Parent Group Info */}
          {parentGroup && (
            <div className={styles.parentGroup}>
              <div className={styles.parentGroupLabel}>Parent Group</div>
              <div className={styles.parentGroupValue}>{(parentGroup.data as GroupNodeData).label}</div>
              <div className={styles.parentGroupHint}>This section belongs to a group</div>
            </div>
          )}
        </>
      )}
    </aside>
  );
}

interface ConditionEditorProps {
  index: number;
  condition: NodeCondition;
  nodeId: string;
  nodes: { id: string; data: unknown }[];
  nodeLabelMap: Record<string, string>;
  onUpdate: (c: NodeCondition) => void;
  onRemove: () => void;
}

function ConditionEditor({ index, condition, nodeLabelMap, nodes, onUpdate, onRemove }: ConditionEditorProps) {
  const update = (patch: Partial<NodeCondition>) => onUpdate({ ...condition, ...patch });
  const sourceLabel = nodeLabelMap[condition.sourceNodeId] ?? '';
  const operatorLabel = OPERATOR_OPTIONS.find((o) => o.value === condition.operator)?.label ?? '';

  const summaryText = condition.sourceNodeId
    ? `Show if ${METRIC_OPTIONS.find((m) => m.value === condition.metric)?.label ?? condition.metric} ${operatorLabel.toLowerCase().split('(')[0].trim()} ${condition.value}${condition.operator === 'between' ? ` – ${condition.valueMax ?? '?'}` : ''}`
    : '';

  return (
    <div className={styles.conditionCard}>
      <div className={styles.conditionCardHeader}>
        <span className={styles.conditionTitle}>Condition {index + 1}</span>
        <button className={styles.removeBtn} onClick={onRemove}><X size={12} /></button>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Source Section</label>
        <select
          className={styles.select}
          value={condition.sourceNodeId}
          onChange={(e) => update({ sourceNodeId: e.target.value })}
        >
          <option value="">Select source section</option>
          {nodes.map((n) => (
            <option key={n.id} value={n.id}>{nodeLabelMap[n.id] ?? n.id}</option>
          ))}
        </select>
        {sourceLabel && <div className={styles.fieldHint}>{sourceLabel}</div>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Operator</label>
          <select
            className={styles.select}
            value={condition.operator}
            onChange={(e) => update({ operator: e.target.value as ConditionOperator })}
          >
            {OPERATOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Threshold</label>
          <div className={styles.inputWithSuffix}>
            <input
              type="number"
              className={styles.input}
              value={condition.value}
              onChange={(e) => update({ value: Number(e.target.value) })}
              min={0}
            />
            <span className={styles.suffix}>%</span>
          </div>
        </div>
      </div>

      {condition.operator === 'between' && (
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Max Value</label>
          <div className={styles.inputWithSuffix}>
            <input
              type="number"
              className={styles.input}
              value={condition.valueMax ?? ''}
              onChange={(e) => update({ valueMax: Number(e.target.value) })}
              min={0}
            />
            <span className={styles.suffix}>%</span>
          </div>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Metric</label>
        <select
          className={styles.select}
          value={condition.metric}
          onChange={(e) => update({ metric: e.target.value as ConditionMetric })}
        >
          {METRIC_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {summaryText && (
        <div className={styles.conditionSummary}>{summaryText}</div>
      )}
    </div>
  );
}
