// Player dashboard with skills and today's quests. Teaches: composing stateful components.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroCard from '../components/HeroCard.jsx';
import LifeTimeline from '../components/LifeTimeline.jsx';
import Modal from '../components/Modal.jsx';
import AddSkillForm from '../components/AddSkillForm.jsx';
import SkillCard from '../components/SkillCard.jsx';
import AddQuestForm from '../components/AddQuestForm.jsx';
import QuestRow from '../components/QuestRow.jsx';
import useGame from '../hooks/useGame.js';
import { isSameDay } from '../utils/dates.js';
import s from './Profile.module.css';

export default function Profile() {
    const { state, dispatch } = useGame();
    const { skills, quests, milestones, rules } = state;
    const [modal, setModal] = useState(null);
    const today = quests.filter(quest => isSameDay(quest.createdAt, new Date()) || (quest.completedAt && isSameDay(quest.completedAt, new Date())));
    const makeUp = quests.filter(quest => !quest.completed && quest.missedAt);
    const recent = milestones.filter(milestone => milestone.unlocked).sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt)).slice(0, 5);
    const skillOf = id => skills.find(skill => skill.id === id);
    return <>
        <HeroCard />
        <LifeTimeline />
        <section className={s.section}>
            <div className={s.heading}><h2 className="section-title">Skills</h2><Link className={s.textLink} to="/skills">View all</Link></div>
            {!skills.length && <p className={s.empty}>No skills yet. Add one to track where your XP goes.</p>}
            <div className={s.grid}>{skills.slice(0, 7).map(skill => <SkillCard key={skill.id} skill={skill} />)}
                <button type="button" className={`${s.addCard} card`} onClick={() => setModal('skill')}>＋<span>Add Skill</span></button>
            </div>
        </section>
        <section className={s.section}>
            <div className={s.heading}><h2 className="section-title">Today's Quests</h2><button className="btn" type="button" onClick={() => setModal('quest')}>＋ Add Quest</button></div>
            {!today.length && <div className={s.empty}>No quests today. Create a quest and make progress toward your next level.</div>}
            {today.map(quest => <QuestRow key={quest.id} quest={quest} skill={skillOf(quest.skillId)}
                onToggle={() => dispatch({ type: quest.completed ? 'UNCOMPLETE_QUEST' : 'COMPLETE_QUEST', id: quest.id })}
                onDelete={() => dispatch({ type: 'DELETE_QUEST', id: quest.id })} />)}
        </section>
        {!!makeUp.length && <section className={s.section}>
            <div className={s.heading}><h2 className="section-title">Missed Quests · Make-up</h2><Link className={s.textLink} to="/history">View history</Link></div>
            <p className={s.empty}>Missed a step? These quests are still yours to complete.</p>
            {makeUp.map(quest => <QuestRow key={quest.id} quest={quest} skill={skillOf(quest.skillId)}
                onToggle={() => dispatch({ type: 'COMPLETE_QUEST', id: quest.id })}
                onDelete={() => dispatch({ type: 'DELETE_QUEST', id: quest.id })} />)}
        </section>}
        <section className={s.section}>
            <div className={s.heading}><h2 className="section-title">Recent Milestones</h2><Link className={s.textLink} to="/achievements">View all</Link></div>
            {!recent.length && <p className={s.empty}>Complete your first quest to unlock a milestone.</p>}
            <div className={s.grid}>{recent.map(milestone => <div key={milestone.id} className={`card ${s.milestone}`}>🏆 {milestone.name}</div>)}</div>
        </section>
        {modal === 'skill' && <Modal title="Add a Skill" onClose={() => setModal(null)}><AddSkillForm onAdd={payload => { dispatch({ type: 'ADD_SKILL', payload }); setModal(null) }} onCancel={() => setModal(null)} /></Modal>}
        {modal === 'quest' && <Modal title="Add a Quest" onClose={() => setModal(null)}><AddQuestForm skills={skills} rules={rules} onAdd={payload => { dispatch({ type: 'ADD_QUEST', payload }); setModal(null) }} onCancel={() => setModal(null)} /></Modal>}
    </>
}
