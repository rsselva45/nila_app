import { useState, useEffect } from 'react';
import { Header } from './components/Header/Header';
import { LeftPanel } from './components/LeftPanel/LeftPanel';
import { Canvas } from './components/Canvas/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
import { useStore } from './store/useStore';
import { getLearningPath } from './services/api';
import styles from './App.module.css';

export default function App() {
  const [mode, setMode] = useState<'builder' | 'preview'>('builder');
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const { learningPathId, loadCanvas, selectedNodeId, selectedEdgeId } = useStore();

  // Restore canvas from backend on mount
  useEffect(() => {
    if (!learningPathId) return;
    getLearningPath(learningPathId).then(loadCanvas).catch(() => {
      localStorage.removeItem('nila_lp_id');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-open the right panel on mobile when something is selected
  useEffect(() => {
    if (selectedNodeId || selectedEdgeId) {
      setRightOpen(true);
    }
  }, [selectedNodeId, selectedEdgeId]);

  function closeAll() {
    setLeftOpen(false);
    setRightOpen(false);
  }

  return (
    <div className={styles.root}>
      <Header
        activeMode={mode}
        onModeChange={setMode}
        onToggleLeft={() => setLeftOpen((o) => !o)}
        leftOpen={leftOpen}
      />

      {(leftOpen || rightOpen) && (
        <div className={styles.backdrop} onClick={closeAll} />
      )}

      <div className={styles.workspace}>
        <LeftPanel isOpen={leftOpen} onClose={() => setLeftOpen(false)} />
        <Canvas />
        <PropertiesPanel isOpen={rightOpen} onClose={() => setRightOpen(false)} />
      </div>
    </div>
  );
}
