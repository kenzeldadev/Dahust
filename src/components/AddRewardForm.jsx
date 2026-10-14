// User-created condition rewards. Teaches: controlled forms and select-driven state.
import { useState } from 'react';
import s from './AddRewardForm.module.css';

export const REWARD_CONDITIONS = [
  ['quests_completed_total', 'Quests completed (total)'],
  ['quests_completed_today', 'Quests completed (today)'],
  ['streak_days', 'Current streak (days)'],
  ['skill_level', 'Reach a skill level'],
  ['xp_total', 'Total XP earned'],
];

export default function AddRewardForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    conditionType: 'quests_completed_today',
    conditionValue: '5',
  });
  const change = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const submit = (event) => {
    event.preventDefault();
    const value = Number(form.conditionValue);
    if (!form.name.trim() || !Number.isInteger(value) || value < 1) return;
    onAdd({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      conditionValue: value,
    });
  };
  return (
    <form className={s.form} onSubmit={submit}>
      <label>
        Reward name
        <input
          className="input"
          autoFocus
          maxLength="80"
          required
          name="name"
          value={form.name}
          onChange={change}
          placeholder="e.g. Hookah Time"
        />
      </label>
      <label>
        Description
        <input
          className="input"
          maxLength="240"
          name="description"
          value={form.description}
          onChange={change}
          placeholder="What does this reward celebrate?"
        />
      </label>
      <label>
        Unlock condition
        <select
          className="input"
          name="conditionType"
          value={form.conditionType}
          onChange={change}
        >
          {REWARD_CONDITIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Condition value
        <input
          className="input"
          type="number"
          min="1"
          step="1"
          required
          name="conditionValue"
          value={form.conditionValue}
          onChange={change}
        />
      </label>
      <div className={s.actions}>
        <button type="submit" className="btn">
          Add Reward
        </button>
        <button type="button" className={s.cancel} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
