// Editable player life-stage timeline. Teaches: list state, forms, and reusable dialogs.
import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Modal from './Modal.jsx';
import useGame from '../hooks/useGame.js';
import { levelFromXp } from '../utils/xp.js';
import { newId } from '../utils/id.js';
import s from './LifeTimeline.module.css';

export default function LifeTimeline() {
  const { state, dispatch } = useGame();
  const [editing, setEditing] = useState(null);
  const level = levelFromXp(state.user.totalXp, state.rules);
  const stages = useMemo(
    () => [...(state.user.lifeStages || [])].sort((a, b) => a.level - b.level),
    [state.user.lifeStages],
  );
  const currentIndex = stages.reduce(
    (best, stage, index) => (stage.level <= level ? index : best),
    -1,
  );
  const [form, setForm] = useState({ name: '', age: '', level: '' });
  const openEditor = (stage) => {
    setEditing(stage);
    setForm({
      name: stage.name,
      age: String(stage.age),
      level: String(stage.level),
    });
  };
  const addStage = () => {
    const stage = {
      id: newId(),
      level: (stages.at(-1)?.level || 0) + 1,
      name: 'New stage',
      age: 0,
    };
    dispatch({ type: 'ADD_LIFE_STAGE', payload: stage });
    openEditor(stage);
  };
  const saveStage = (event) => {
    event.preventDefault();
    const age = Number(form.age),
      stageLevel = Number(form.level);
    if (
      !form.name.trim() ||
      !Number.isInteger(age) ||
      age < 0 ||
      !Number.isInteger(stageLevel) ||
      stageLevel < 1
    )
      return;
    dispatch({
      type: 'UPDATE_LIFE_STAGE',
      id: editing.id,
      payload: { name: form.name.trim(), age, level: stageLevel },
    });
    setEditing(null);
  };
  return (
    <section className={`card ${s.timelineCard}`}>
      <div className={s.heading}>
        <div>
          <h2 className="section-title">Life Timeline</h2>
          <p>Mark the stages that shaped your journey.</p>
        </div>
        <button type="button" className={s.add} onClick={addStage}>
          <Plus size={16} /> Add Stage
        </button>
      </div>
      {!stages.length ? (
        <p className={s.empty}>
          Add your first life stage to start your timeline.
        </p>
      ) : (
        <div className={s.scroller} aria-label="Life stages timeline">
          <div className={s.track}>
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className={`${s.stage} ${index < currentIndex ? s.past : ''} ${index === currentIndex ? s.current : ''}`}
              >
                <button
                  type="button"
                  className={s.node}
                  onClick={() => openEditor(stage)}
                  aria-label={`Edit ${stage.name}, age ${stage.age}, level ${stage.level}`}
                >
                  <span className={s.dot}>{stage.level}</span>
                  <strong>{stage.name}</strong>
                  <small>Age {stage.age}</small>
                  <span className={s.edit}>
                    <Pencil size={13} /> Edit
                  </span>
                </button>
                <button
                  type="button"
                  className={s.delete}
                  onClick={() =>
                    dispatch({ type: 'DELETE_LIFE_STAGE', id: stage.id })
                  }
                  aria-label={`Delete ${stage.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {editing && (
        <Modal title="Edit Life Stage" onClose={() => setEditing(null)}>
          <form className={s.form} onSubmit={saveStage}>
            <label>
              Name
              <input
                className="input"
                autoFocus
                required
                maxLength="60"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Age
              <input
                className="input"
                type="number"
                min="0"
                step="1"
                required
                value={form.age}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    age: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Level
              <input
                className="input"
                type="number"
                min="1"
                step="1"
                required
                value={form.level}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    level: event.target.value,
                  }))
                }
              />
            </label>
            <button className="btn" type="submit">
              Save Stage
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
