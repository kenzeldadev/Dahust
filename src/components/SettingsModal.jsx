// Edits game rules and manages portable save data. Teaches: controlled forms + File API.
import { useRef, useState } from 'react';
import Modal from './Modal.jsx';
import useGame from '../hooks/useGame.js';
import { validateImportedState } from '../utils/validation.js';
import s from './SettingsModal.module.css';

const tiers = ['Trivial', 'Easy', 'Medium', 'Hard', 'Epic', 'Legendary'];

export default function SettingsModal({ onClose }) {
  const { state, dispatch, toast } = useGame();
  const [rules, setRules] = useState(() => ({
    ...state.rules,
    difficultyXp: { ...state.rules.difficultyXp },
  }));
  const [rulesError, setRulesError] = useState('');
  const [importError, setImportError] = useState('');
  const fileInput = useRef(null);
  const setNumber = (key, value) =>
    setRules((current) => ({ ...current, [key]: value }));
  const setTier = (tier, value) =>
    setRules((current) => ({
      ...current,
      difficultyXp: { ...current.difficultyXp, [tier]: value },
    }));
  const saveRules = (event) => {
    event.preventDefault();
    const numbers = [
      rules.maxLevel,
      rules.curveBase,
      rules.curveExponent,
      ...tiers.map((tier) => rules.difficultyXp[tier]),
    ];
    if (
      !Number.isInteger(Number(rules.maxLevel)) ||
      numbers.some(
        (value) => !Number.isFinite(Number(value)) || Number(value) <= 0,
      )
    ) {
      setRulesError(
        'Max level must be a positive whole number; all other rule values must be positive numbers.',
      );
      return;
    }
    dispatch({
      type: 'UPDATE_RULES',
      payload: {
        maxLevel: Number(rules.maxLevel),
        curveBase: Number(rules.curveBase),
        curveExponent: Number(rules.curveExponent),
        difficultyXp: Object.fromEntries(
          tiers.map((tier) => [tier, Number(rules.difficultyXp[tier])]),
        ),
      },
    });
    setRulesError('');
    toast('Game rules saved');
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dahust-save-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importData = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      const checked = validateImportedState(imported);
      dispatch({ type: 'IMPORT', payload: checked });
      setImportError('');
      toast('Save imported successfully');
    } catch (cause) {
      setImportError(
        cause instanceof Error
          ? cause.message
          : 'Could not read this save file.',
      );
    }
  };
  const reset = () => {
    if (!window.confirm('Reset all Dahust data? This cannot be undone.'))
      return;
    dispatch({ type: 'RESET_ALL' });
    onClose();
  };
  return (
    <Modal title="Settings" onClose={onClose}>
      <form className={s.form} onSubmit={saveRules}>
        <section>
          <h3 className="section-title">Game Rules</h3>
          <div className={s.grid}>
            <label>
              Max level
              <input
                className="input"
                type="number"
                min="1"
                step="1"
                value={rules.maxLevel}
                onChange={(e) => setNumber('maxLevel', e.target.value)}
              />
            </label>
            <label>
              Curve base
              <input
                className="input"
                type="number"
                min="0.01"
                step="any"
                value={rules.curveBase}
                onChange={(e) => setNumber('curveBase', e.target.value)}
              />
            </label>
            <label>
              Curve exponent
              <input
                className="input"
                type="number"
                min="0.01"
                step="any"
                value={rules.curveExponent}
                onChange={(e) => setNumber('curveExponent', e.target.value)}
              />
            </label>
          </div>
          <div className={s.tiers}>
            {tiers.map((tier) => (
              <label key={tier}>
                {tier}
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="any"
                  value={rules.difficultyXp[tier]}
                  onChange={(e) => setTier(tier, e.target.value)}
                />
                <small>
                  New quests award {rules.difficultyXp[tier] || 0} XP
                </small>
              </label>
            ))}
          </div>
          {rulesError && (
            <p className={s.error} role="alert">
              {rulesError}
            </p>
          )}
          <button className="btn" type="submit">
            Save Rules
          </button>
        </section>
        <section className={s.data}>
          <h3 className="section-title">Data</h3>
          <div className={s.actions}>
            <button type="button" className="btn" onClick={exportData}>
              Export JSON
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => fileInput.current?.click()}
            >
              Import JSON
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={importData}
            />
            <button type="button" className={s.danger} onClick={reset}>
              Reset All
            </button>
          </div>
          {importError && (
            <p className={s.error} role="alert">
              {importError}
            </p>
          )}
        </section>
      </form>
    </Modal>
  );
}
