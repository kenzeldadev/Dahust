// Controlled quest creator using current game rules. Teaches: select inputs + props.
import { useState } from 'react';
import s from './AddQuestForm.module.css';

export default function AddQuestForm({ skills, rules, onAdd, onCancel }) {
    const [title, setTitle] = useState('');
    const [difficulty, setDifficulty] = useState('Easy');
    const [skillId, setSkillId] = useState('');
    const submit = event => {
        event.preventDefault();
        if (!title.trim()) return;
        onAdd({ title: title.trim(), difficulty, skillId: skillId || null });
    };
    return <form className={s.form} onSubmit={submit}>
        <label>Quest title<input className="input" autoFocus required maxLength="120" value={title} onChange={event => setTitle(event.target.value)} placeholder="What will you accomplish?" /></label>
        <label>Difficulty<select className="input" value={difficulty} onChange={event => setDifficulty(event.target.value)}>{Object.keys(rules.difficultyXp).map(tier => <option key={tier} value={tier}>{tier} · {rules.difficultyXp[tier]} XP</option>)}</select></label>
        <label>Skill<select className="input" value={skillId} onChange={event => setSkillId(event.target.value)}><option value="">No skill</option>{skills.map(skill => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></label>
        <p className={s.preview}>Reward: <strong>+{rules.difficultyXp[difficulty]} XP</strong></p>
        <div className={s.actions}><button className="btn" type="submit">Add Quest</button><button className={s.cancel} type="button" onClick={onCancel}>Cancel</button></div>
    </form>
}
