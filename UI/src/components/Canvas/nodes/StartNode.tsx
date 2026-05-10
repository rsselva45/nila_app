import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { CirclePlay } from 'lucide-react';
import styles from './nodes.module.css';

export const StartNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`${styles.startNode} ${selected ? styles.selected : ''}`}>
      <div className={styles.startIcon}>
        <CirclePlay size={16} fill="#10b981" color="#ffffff" />
      </div>
      <span className={styles.startLabel}>{data.label}</span>
      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
});

StartNode.displayName = 'StartNode';
