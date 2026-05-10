import { useState } from 'react';
import { Header } from './components/Header/Header';
import { LeftPanel } from './components/LeftPanel/LeftPanel';
import { Canvas } from './components/Canvas/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
import styles from './App.module.css';

export default function App() {
  const [mode, setMode] = useState<'builder' | 'preview'>('builder');

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
