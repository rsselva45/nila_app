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
  const { learningPathId, loadCanvas } = useStore();

  useEffect(() => {
    if (!learningPathId) return;
    getLearningPath(learningPathId).then(loadCanvas).catch(() => {
      // ID in localStorage but path not found on server — start fresh
      localStorage.removeItem('nila_lp_id');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.root}>
      <Header activeMode={mode} onModeChange={setMode} />
      <div className={styles.workspace}>
        <LeftPanel />
        <Canvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}
