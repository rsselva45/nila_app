import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Layers } from 'lucide-react';
import type { GroupNodeData } from '../../../types';
import styles from './nodes.module.css';

export const GroupNode = memo(({ data, selected }: NodeProps<GroupNodeData>) => {
  return (
    <div className={`${styles.groupNode} ${selected ? styles.selectedGroup : ''}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <div className={styles.groupHeader}>
        <div className={styles.groupIconWrap}>
          <Layers size={14} />
        </div>
        <div className={styles.groupText}>
          <div className={styles.groupLabel}>{data.label}</div>
          {data.description && (
            <div className={styles.groupDesc}>{data.description}</div>
          )}
        </div>
        <span className={styles.groupBadge}>Group</span>
      </div>

      {/* Children render inside via React Flow parentNode */}
    </div>
  );
});

GroupNode.displayName = 'GroupNode';
