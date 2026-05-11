import { useState, useEffect } from 'react';
import { Square, Layers, Info, ChevronDown, ChevronRight, BookOpen, ClipboardList, Loader, AlertCircle } from 'lucide-react';
import { fetchComponents } from '../../services/api';
import type { ApiComponent } from '../../services/api';
import styles from './LeftPanel.module.css';

interface DragItem {
  type: 'sectionNode' | 'groupNode';
  label: string;
  description: string;
  icon: 'square' | 'layers';
}

const canvasItems: DragItem[] = [
  { type: 'sectionNode', label: 'Section', description: 'Add a quiz/assessment section', icon: 'square' },
  { type: 'groupNode', label: 'Group', description: 'Group sections for conditional routing', icon: 'layers' },
];

const exampleTree = [
  {
    id: 'ex-math1',
    label: 'Math Module 1',
    sublabel: 'Regular section',
    children: [
      {
        id: 'ex-math2-group',
        label: 'Math Module 2 (Group)',
        isGroup: true,
        children: [
          { id: 'ex-easy', label: 'Easy Version', condition: 'If score < 50%', isEasy: true },
          { id: 'ex-adv', label: 'Advanced', condition: 'If score ≥ 50%', isAdvanced: true },
        ],
      },
    ],
  },
];

interface LeftPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function LeftPanel({ isOpen = false, onClose: _onClose }: LeftPanelProps) {
  const [exampleOpen, setExampleOpen] = useState(true);
  const [components, setComponents] = useState<ApiComponent[]>([]);
  const [loadingComponents, setLoadingComponents] = useState(true);
  const [componentError, setComponentError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingComponents(true);
    fetchComponents()
      .then((items) => { if (!cancelled) { setComponents(items); setComponentError(null); } })
      .catch((err: unknown) => {
        if (!cancelled) setComponentError(err instanceof Error ? err.message : 'Failed to load');
      })
      .finally(() => { if (!cancelled) setLoadingComponents(false); });
    return () => { cancelled = true; };
  }, []);

  const onDragStart = (event: React.DragEvent, item: DragItem) => {
    event.dataTransfer.setData('application/nila-node-type', item.type);
    event.dataTransfer.setData('application/nila-node-label', item.label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onComponentDragStart = (event: React.DragEvent, component: ApiComponent) => {
    event.dataTransfer.setData('application/nila-node-type', 'sectionNode');
    event.dataTransfer.setData('application/nila-node-label', component.title);
    event.dataTransfer.setData('application/nila-component-id', component.id);
    event.dataTransfer.setData('application/nila-component-type', component.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
      {/* Canvas elements */}
      <div className={styles.section}>
        <h2 className={styles.heading}>Add to Canvas</h2>
        <p className={styles.subheading}>Drag or click to add to canvas</p>
        <div className={styles.componentList}>
          {canvasItems.map((item) => (
            <div
              key={item.type}
              className={styles.componentCard}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
            >
              <div className={`${styles.iconBox} ${item.icon === 'layers' ? styles.iconBoxGroup : styles.iconBoxSection}`}>
                {item.icon === 'square' ? <Square size={16} /> : <Layers size={16} />}
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardLabel}>{item.label}</span>
                <span className={styles.cardDesc}>{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available content from API */}
      <div className={styles.section}>
        <h2 className={styles.heading}>Available Content</h2>
        <p className={styles.subheading}>Drag a component onto a section node</p>

        {loadingComponents && (
          <div className={styles.statusRow}>
            <Loader size={13} className={styles.spin} />
            <span>Loading…</span>
          </div>
        )}
        {componentError && (
          <div className={`${styles.statusRow} ${styles.errorRow}`}>
            <AlertCircle size={13} />
            <span>API offline</span>
          </div>
        )}
        {!loadingComponents && !componentError && (
          <div className={styles.componentList}>
            {components.map((c) => (
              <div
                key={c.id}
                className={`${styles.componentCard} ${styles.componentCardContent}`}
                draggable
                onDragStart={(e) => onComponentDragStart(e, c)}
                title={c.shortDescription}
              >
                <div className={`${styles.iconBox} ${c.type === 'assessment' ? styles.iconBoxSection : styles.iconBoxGroup}`}>
                  {c.type === 'assessment' ? <ClipboardList size={14} /> : <BookOpen size={14} />}
                </div>
                <div className={styles.cardText}>
                  <span className={styles.cardLabel}>{c.title}</span>
                  <span className={styles.cardDesc}>{c.approximateDurationMinutes} min · {c.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.infoBox}>
        <div className={styles.infoTitle}>
          <Info size={13} className={styles.infoIcon} />
          <strong>How it works:</strong>
        </div>
        <ul className={styles.infoList}>
          <li><span className={styles.infoBullet}>→</span> Add <strong>Sections</strong> modules</li>
          <li><span className={styles.infoBullet}>→</span> Use <strong>Groups</strong> for conditional routing</li>
          <li><span className={styles.infoBullet}>→</span> Set conditions based on previous section scores</li>
          <li><span className={styles.infoBullet}>→</span> System routes learners based on performance</li>
        </ul>
      </div>

      <div className={styles.section}>
        <button className={styles.exampleToggle} onClick={() => setExampleOpen((o) => !o)}>
          <span className={styles.exampleLabel}>Example: SAT Adaptive Test</span>
          {exampleOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {exampleOpen && (
          <div className={styles.exampleTree}>
            {exampleTree.map((node) => (
              <div key={node.id} className={styles.treeRoot}>
                <div className={styles.treeNode}>
                  <div className={styles.treeDot} />
                  <div>
                    <div className={styles.treeLabel}>{node.label}</div>
                    {node.sublabel && <div className={styles.treeSubLabel}>{node.sublabel}</div>}
                  </div>
                </div>
                {node.children?.map((child) => (
                  <div key={child.id} className={styles.treeChildGroup}>
                    <div className={`${styles.treeNode} ${styles.treeGroupNode}`}>
                      <div className={`${styles.treeDot} ${styles.treeDotGroup}`} />
                      <div className={styles.treeLabel}>{child.label}</div>
                    </div>
                    {child.children?.map((leaf) => (
                      <div key={leaf.id} className={`${styles.treeLeaf} ${leaf.isEasy ? styles.treeLeafEasy : styles.treeLeafAdv}`}>
                        <div className={styles.treeLabel}>{leaf.label}</div>
                        <div className={styles.treeCondition}>{leaf.condition}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
