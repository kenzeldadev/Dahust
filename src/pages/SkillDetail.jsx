// One-skill progression, monthly targets, and quest analytics. Teaches: route params + aggregation.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Target } from 'lucide-react';
import Modal from '../components/Modal.jsx';
import QuestRow from '../components/QuestRow.jsx';
import useGame from '../hooks/useGame.js';
import { isCompletedHistoryEntry } from '../utils/history.js';
import { levelFromXp, progressPercent, xpIntoCurrentLevel, xpNeededForLevel } from '../utils/xp.js';
import s from './SkillDetail.module.css';

const monthKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const addDays = (date, count) => { const next = new Date(date); next.setDate(next.getDate() + count); return next };

export default function SkillDetail() {
    const { id } = useParams();
    const { state, dispatch } = useGame();
    const skill = state.skills.find(item => item.id === id);
    const [editTarget, setEditTarget] = useState(false);
    const [target, setTarget] = useState({ quests: skill?.monthlyTarget?.quests ?? 20, xp: skill?.monthlyTarget?.xp ?? 500 });
    const now = new Date();
    const allHistory = state.history.filter(entry => entry.skillId === id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const completedHistory = allHistory.filter(isCompletedHistoryEntry);
    const monthHistory = completedHistory.filter(entry => monthKey(new Date(entry.timestamp)) === monthKey(now));
    const quests = state.quests.filter(quest => quest.skillId === id);
    const totalXp = completedHistory.reduce((sum, entry) => sum + entry.xp, 0);
    const level = levelFromXp(totalXp, state.rules);
    const chartData = Array.from({ length: 30 }, (_, index) => {
        const date = addDays(now, index - 29), key = dateKey(date);
        return { key, day: date.getDate(), xp: completedHistory.filter(entry => dateKey(new Date(entry.timestamp)) === key).reduce((sum, entry) => sum + entry.xp, 0) }
    });
    const maxDailyXp = Math.max(1, ...chartData.map(item => item.xp));
    const daysThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const expectedFraction = now.getDate() / daysThisMonth;
    const getTone = (current, goal) => current >= goal ? s.exceeded : current / Math.max(goal, 1) >= expectedFraction ? s.onTrack : s.behind;
    if (!skill) return <section className={s.notFound}><h1 className="section-title">Skill not found</h1><p>This skill may have been deleted.</p><Link to="/skills">← Back to Skills</Link></section>;
    const skillOf = skillId => state.skills.find(item => item.id === skillId);
    const saveTarget = event => {
        event.preventDefault();
        const questsTarget = Number(target.quests), xpTarget = Number(target.xp);
        if (!Number.isInteger(questsTarget) || questsTarget < 0 || !Number.isInteger(xpTarget) || xpTarget < 0) return;
        dispatch({ type: 'SET_SKILL_TARGET', id, payload: { quests: questsTarget, xp: xpTarget } });
        setEditTarget(false)
    };
    const targetValues = skill.monthlyTarget || { quests: 20, xp: 500 };
    return <div className={s.page}>
        <Link to="/skills" className={s.back}><ArrowLeft size={16} /> All Skills</Link>
        <header className={`card ${s.hero}`} style={{ borderLeftColor: skill.color }}>
            <span className={s.icon} style={{ color: skill.color, background: `${skill.color}20` }}><Target size={30} /></span>
            <div className={s.heroInfo}><h1>{skill.name}</h1><p>Level {level} · {totalXp.toLocaleString()} total XP · {completedHistory.length} quests completed</p>
                <div className={s.progress}><span style={{ width: `${progressPercent(totalXp, state.rules)}%`, background: skill.color }} /></div>
                <small>{level >= state.rules.maxLevel ? 'MAX LEVEL' : `${xpIntoCurrentLevel(totalXp, state.rules)} / ${xpNeededForLevel(level, state.rules)} XP to next level`}</small>
            </div><strong className={s.level}>LV {level}</strong>
        </header>
        <section className={`card ${s.targets}`}>
            <div className={s.targetHeading}><div><h2 className="section-title">Monthly Targets</h2><p>{now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p></div><button type="button" className={s.edit} onClick={() => { setTarget({ quests: targetValues.quests, xp: targetValues.xp }); setEditTarget(true) }}>Edit Target</button></div>
            <TargetProgress label="This Month" current={monthHistory.length} goal={targetValues.quests} unit="quests" tone={getTone(monthHistory.length, targetValues.quests)} />
            <TargetProgress label="XP this month" current={monthHistory.reduce((sum, entry) => sum + entry.xp, 0)} goal={targetValues.xp} unit="XP" tone={getTone(monthHistory.reduce((sum, entry) => sum + entry.xp, 0), targetValues.xp)} />
        </section>
        <section className={`card ${s.chartCard}`}>
            <h2 className="section-title">XP Over Time · Last 30 Days</h2>
            <div className={s.chart} role="img" aria-label={`Daily XP chart for ${skill.name}`}>{chartData.map(item => <div key={item.key} className={s.barColumn} title={`${item.key}: ${item.xp} XP`}>
                <span className={s.bar} style={{ height: `${item.xp ? Math.max(4, item.xp / maxDailyXp * 100) : 0}%`, background: skill.color }} />
                {(item.day === 1 || item.day % 5 === 0) && <small>{item.day}</small>}
            </div>)}</div>
        </section>
        <section>
            <h2 className="section-title">Quests</h2>
            {!quests.length ? <p className={s.empty}>No quests for this skill yet. Add a quest from your <Link to="/">profile</Link>.</p> :
                quests.map(quest => <QuestRow key={quest.id} quest={quest} skill={skillOf(quest.skillId)} onToggle={() => dispatch({ type: quest.completed ? 'UNCOMPLETE_QUEST' : 'COMPLETE_QUEST', id: quest.id })} onDelete={() => dispatch({ type: 'DELETE_QUEST', id: quest.id })} />)}
        </section>
        <section>
            <h2 className="section-title">History</h2>
            {!allHistory.length ? <p className={s.empty}>Complete a quest to start building skill history.</p> :
                <div className={s.history}>{allHistory.map(entry => <article className={`card ${s.historyEntry}`} key={entry.id}><span><strong>{entry.title}</strong><small>{new Date(entry.timestamp).toLocaleDateString()} · {entry.difficulty}</small></span><b>{entry.status === 'missed' ? 'Missed · make-up available' : `+${entry.xp} XP`}</b></article>)}</div>}
        </section>
        {editTarget && <Modal title="Edit Monthly Target" onClose={() => setEditTarget(false)}>
            <form className={s.targetForm} onSubmit={saveTarget}>
                <label>Quests this month<input className="input" type="number" min="0" step="1" value={target.quests} onChange={event => setTarget(current => ({ ...current, quests: event.target.value }))} /></label>
                <label>XP this month<input className="input" type="number" min="0" step="1" value={target.xp} onChange={event => setTarget(current => ({ ...current, xp: event.target.value }))} /></label>
                <button className="btn" type="submit">Save Target</button>
            </form>
        </Modal>}
    </div>
}

function TargetProgress({ label, current, goal, unit, tone }) {
    const percent = goal > 0 ? Math.min(100, current / goal * 100) : 100;
    return <div className={s.targetRow}>
        <div className={s.targetLabel}><strong>{label}</strong><span className={tone}>{current} / {goal} {unit}</span></div>
        <div className={s.targetBar}><span className={tone} style={{ width: `${percent}%` }} /></div>
    </div>
}
