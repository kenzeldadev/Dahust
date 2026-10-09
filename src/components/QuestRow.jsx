// Quest row with completion controls and safe skill fallback. Teaches: conditional rendering.
import { Trash2 } from 'lucide-react';
import s from './QuestRow.module.css';

export default function QuestRow({ quest, skill, onToggle, onDelete }) {
    const skillName = quest.skillId ? skill?.name || 'Unknown skill' : 'No skill';
    return <article className={`card ${s.row}`}>
        <label className={s.check}><input type="checkbox" checked={quest.completed} onChange={onToggle} aria-label={`${quest.completed ? 'Uncomplete' : 'Complete'} ${quest.title}`} /></label>
        <span className={`${s.title} ${quest.completed ? s.done : ''}`}>{quest.title}</span>
        <span className={s.skill} style={{ color: skill?.color || 'var(--muted)' }}>{skillName}</span>
        <span className={s.pill}>{quest.difficulty}</span><strong className={s.xp}>+{quest.xp} XP</strong>
        <button type="button" className={s.delete} onClick={onDelete} aria-label={`Delete ${quest.title}`}><Trash2 size={17} /></button>
    </article>
}
