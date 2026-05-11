import { Eye, Save, Play, Check, AlertCircle, Loader, Menu, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { buildLearningPathPayload, saveLearningPath } from '../../services/api';
import styles from './Header.module.css';

interface HeaderProps {
  activeMode: 'builder' | 'preview';
  onModeChange: (mode: 'builder' | 'preview') => void;
  onToggleLeft: () => void;
  leftOpen: boolean;
}

export function Header({ activeMode, onModeChange, onToggleLeft, leftOpen }: HeaderProps) {
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
      {/* Hamburger — visible on mobile only via CSS */}
      <button
        className={`${styles.menuBtn} ${leftOpen ? styles.menuBtnActive : ''}`}
        onClick={onToggleLeft}
        aria-label="Toggle content panel"
      >
        {leftOpen ? <X size={16} /> : <Menu size={16} />}
      </button>

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
          <span className={styles.btnLabel}>Builder</span>
        </button>
        <button
          className={`${styles.tab} ${activeMode === 'preview' ? styles.tabActive : ''}`}
          onClick={() => onModeChange('preview')}
        >
          <Eye size={14} />
          <span className={styles.btnLabel}>Preview</span>
        </button>
      </div>

      <div className={styles.actions}>
        {saveStatus === 'saved' && (
          <span className={styles.saveIndicator}>
            <Check size={13} />
            <span>Saved</span>
          </span>
        )}
        {saveStatus === 'error' && (
          <span className={`${styles.saveIndicator} ${styles.saveError}`} title={saveError ?? undefined}>
            <AlertCircle size={13} />
            <span>Error</span>
          </span>
        )}

        <button className={styles.btnSecondary} onClick={() => handleSave('draft')} disabled={isSaving}>
          {isSaving ? <Loader size={15} className={styles.spin} /> : <Save size={15} />}
          <span className={styles.btnLabel}>Save Draft</span>
        </button>
        <button className={styles.btnPrimary} onClick={() => handleSave('published')} disabled={isSaving}>
          <Play size={15} fill="currentColor" />
          <span className={styles.btnLabel}>Publish</span>
        </button>
      </div>
    </header>
  );
}
