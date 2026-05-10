import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { LayoutList } from 'lucide-react';
import type { SectionNodeData } from '../../../types';
import styles from './nodes.module.css';

export const SectionNode = memo(({ data, selected }: NodeProps<SectionNodeData>) => {
  const isInsideGroup = !!data.parentGroupId;

  return (
    <div className={`${styles.sectionNode} ${selected ? styles.selectedSection : ''} ${isInsideGroup ? styles.sectionInGroup : ''}`}>
      <Handle type="target" position={Position.Top} className={styles.handle} />

      <div className={styles.sectionIcon}>
        <LayoutList size={14} />
      </div>

      <div className={styles.sectionContent}>
        <div className={styles.sectionLabel}>{data.label}</div>
        {(data.questions || data.durationMinutes) && (
          <div className={styles.sectionMeta}>
            {data.questions ? `${data.questions} questions` : ''}
            {data.questions && data.durationMinutes ? ' • ' : ''}
            {data.durationMinutes ? `${data.durationMinutes} minutes` : ''}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className={styles.handle} />
    </div>
  );
});

SectionNode.displayName = 'SectionNode';
