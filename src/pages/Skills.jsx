// Skill progression manager with derived XP and inline naming. Teaches: derived state + editing.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import AddSkillForm from '../components/AddSkillForm.jsx';
import { SKILL_ICONS } from '../components/AddSkillForm.jsx';
import useGame from '../hooks/useGame.js';
import { levelFromXp, progressPercent, xpIntoCurrentLevel, xpNeededForLevel } from '../utils/xp.js';
import s from './Skills.module.css';

export default function Skills() {
    const { state, dispatch } = useGame();
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const startEdit = skill => { setEditing(skill.id); setName(skill.name) };
    const saveName = skill => {
        const next = name.trim();
        if (next) dispatch({ type: 'UPDATE_SKILL', id: skill.id, payload: { name: next } });
        else setName(skill.name);
        setEditing(null)
    };
    return <section>
        <div className={s.heading}><div><h1 className="section-title">Skills</h1><p className={s.intro}>Build experience by completing quests assigned to each skill.</p></div></div>
        {!state.skills.length ? <div className={s.empty}><p>No skills yet. Add your first skill to start tracking progress.</p><button className="btn" type="button" onClick={() => setModalOpen(true)}>＋ Add Skill</button></div> :
            <div className={s.list}>{state.skills.map(skill => {
                const xp = state.history.filter(entry => entry.skillId === skill.id).reduce((total, entry) => total + entry.xp, 0);
                const count = state.history.filter(entry => entry.skillId === skill.id).length;
                const level = levelFromXp(xp, state.rules);
                const Icon = SKILL_ICONS[skill.icon] || SKILL_ICONS.Star;
                return <article key={skill.id} className={`card ${s.skill}`} style={{ borderLeftColor: skill.color }}>
                    <span className={s.icon} style={{ color: skill.color, background: `${skill.color}20` }}><Icon size={24} /></span>
                    <div className={s.content}>
                        {editing === skill.id ? <input className={`input ${s.nameInput}`} autoFocus value={name} aria-label="Edit skill name" onChange={event => setName(event.target.value)} onBlur={() => saveName(skill)} onKeyDown={event => { if (event.key === 'Enter') saveName(skill); if (event.key === 'Escape') setEditing(null) }} /> :
                            <button type="button" className={s.name} onClick={() => startEdit(skill)} aria-label={`Edit ${skill.name}`}>{skill.name}</button>}
                        <div className={s.xpLine}><span>Level {level}</span><span>{xp} total XP</span></div>
                        <div className={s.progress}><span style={{ width: `${progressPercent(xp, state.rules)}%` }} /></div>
                        <small className={s.next}>{level >= state.rules.maxLevel ? 'MAX LEVEL' : `${xpIntoCurrentLevel(xp, state.rules)} / ${xpNeededForLevel(level, state.rules)} XP to next level`} · {count} quests completed</small>
                    </div>
                    <span className={s.level}>LV {level}</span>
                    <button type="button" className={s.delete} aria-label={`Delete ${skill.name}`} onClick={() => dispatch({ type: 'DELETE_SKILL', id: skill.id })}><Trash2 size={18} /></button>
                </article>
            })}</div>}
        {state.skills.length > 0 && <button className={`btn ${s.addBottom}`} type="button" onClick={() => setModalOpen(true)}>＋ Add Skill</button>}
        {modalOpen && <Modal title="Add a Skill" onClose={() => setModalOpen(false)}><AddSkillForm onAdd={payload => { dispatch({ type: 'ADD_SKILL', payload }); setModalOpen(false) }} onCancel={() => setModalOpen(false)} /></Modal>}
        <p className={s.help}>Skill XP is calculated from quest history and remains available even if you rename a skill. <Link to="/history">View history</Link>.</p>
    </section>
}
