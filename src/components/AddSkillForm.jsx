// Controlled skill creator with a small curated icon set. Teaches: form state + validation.
import { useState } from 'react';
import {
  Activity,
  BookOpen,
  Code2,
  Dumbbell,
  Flame,
  Heart,
  Languages,
  Music,
  Palette,
  Star,
} from 'lucide-react';
import s from './AddSkillForm.module.css';

export const SKILL_ICONS = {
  Activity,
  BookOpen,
  Code2,
  Dumbbell,
  Flame,
  Heart,
  Languages,
  Music,
  Palette,
  Star,
};

export default function AddSkillForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#22d3ee');
  const [icon, setIcon] = useState('Star');
  const submit = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), color, icon });
  };
  return (
    <form className={s.form} onSubmit={submit}>
      <label>
        Skill name
        <input
          className="input"
          autoFocus
          required
          maxLength="40"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Frontend development"
        />
      </label>
      <label>
        Color
        <input
          className={s.color}
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />
      </label>
      <label>
        Icon
        <select
          className="input"
          value={icon}
          onChange={(event) => setIcon(event.target.value)}
        >
          {Object.keys(SKILL_ICONS).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <div className={s.actions}>
        <button className="btn" type="submit">
          Create Skill
        </button>
        <button className={s.cancel} type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
