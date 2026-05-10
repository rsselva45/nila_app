import { Eye, Save, Play, Check, AlertCircle, Loader } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { buildLearningPathPayload, saveLearningPath } from '../../services/api';
import styles from './Header.module.css';

interface HeaderProps {
  activeMode: 'builder' | 'preview';
  onModeChange: (mode: 'builder' | 'preview') => void;
}

export function Header({ activeMode, onModeChange }: HeaderProps) {
  const {
    nodes, edges,
    learningPathId, learningPathName, saveStatus, saveError,
    setLearningPathName, setSaveStatus, setLearningPathId,
  } = useStore();

  const isSaving = saveStatus === 'saving';

  async function handleSave(status: 'draft' | 'published') {
    setSaveStatus('saving');
    try {
      const payload = buildLearningPathPayload(learningPathName, status, nodes, edges, learningPathId ?? undefined);
      const saved = await saveLearningPath(payload);
      if (saved.id) setLearningPathId(saved.id);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error', err instanceof Error ? err.message : 'Save failed');
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <input
          className={styles.nameInput}
          value={learningPathName}
          onChange={(e) => setLearningPathName(e.target.value)}
          aria-label="Learning path name"
        />
        <p>Create conditional quiz flows with adaptive sections</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeMode === 'builder' ? styles.tabActive : ''}`}
          onClick={() => onModeChange('builder')}
        >
          Builder
        </button>
        <button
          className={`${styles.tab} ${activeMode === 'preview' ? styles.tabActive : ''}`}
          onClick={() => onModeChange('preview')}
        >
          <Eye size={14} />
          Preview
        </button>
      </div>

      <div className={styles.actions}>
        {saveStatus === 'saved' && (
          <span className={styles.saveIndicator}>
            <Check size={13} /> Saved
          </span>
        )}
        {saveStatus === 'error' && (
          <span className={`${styles.saveIndicator} ${styles.saveError}`} title={saveError ?? undefined}>
            <AlertCircle size={13} /> Error
          </span>
        )}

        <button className={styles.btnSecondary} onClick={() => handleSave('draft')} disabled={isSaving}>
          {isSaving ? <Loader size={15} className={styles.spin} /> : <Save size={15} />}
          Save Draft
        </button>
        <button className={styles.btnPrimary} onClick={() => handleSave('published')} disabled={isSaving}>
          <Play size={15} fill="currentColor" />
          Publish
        </button>
      </div>
    </header>
  );
}
