import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { CheckCircle2 } from 'lucide-react';
import styles from './nodes.module.css';

export const EndNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`${styles.endNode} ${selected ? styles.selectedEnd : ''}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} />
      <div className={styles.endIcon}>
        <CheckCircle2 size={16} color="#ffffff" />
      </div>
      <span className={styles.endLabel}>{data.label}</span>
    </div>
  );
});

EndNode.displayName = 'EndNode';
