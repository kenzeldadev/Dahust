// Milestone collection and portfolio manager. Teaches: filtering + modal composition.
import { useState } from 'react';
import Modal from '../components/Modal.jsx';
import AddAchievementForm from '../components/AddAchievementForm.jsx';
import AchievementBadge from '../components/AchievementBadge.jsx';
import MilestoneBadge from '../components/MilestoneBadge.jsx';
import AddRewardForm from '../components/AddRewardForm.jsx';
import useGame from '../hooks/useGame.js';
import { milestoneProgress } from '../utils/milestones.js';
import s from './Achievements.module.css';

export default function Achievements() {
    const { state, dispatch } = useGame();
    const [dialog, setDialog] = useState(null);
    const [adding, setAdding] = useState(false);
    const [addingReward, setAddingReward] = useState(false);
    const progress = dialog?.type === 'milestone' ? milestoneProgress(dialog.item, state) : null;
    const addEntry = payload => { dispatch({ type: 'ADD_PORTFOLIO_ENTRY', payload }); setAdding(false) };
    const deleteEntry = entry => {
        if (window.confirm(`Delete "${entry.title}" from your portfolio?`)) {
            dispatch({ type: 'DELETE_PORTFOLIO_ENTRY', id: entry.id });
            setDialog(null)
        }
    };
    const conditionText = reward => {
        const labels = { quests_completed_total: 'total quests', quests_completed_today: 'quests today', streak_days: 'streak days', skill_level: 'skill level', xp_total: 'total XP' };
        return `${reward.conditionValue} ${labels[reward.conditionType] || 'progress'}`;
    };
    const rewardCards = rewards => rewards.map(reward => <article key={reward.id} className={`card ${s.rewardCard} ${reward.claimed ? s.claimed : ''}`}>
        <div className={s.rewardInfo}><strong>{reward.name}</strong><p>{reward.description || 'A reward for your progress.'}</p><small>Unlock at {conditionText(reward)}</small></div>
        <span className={s.rewardStatus}>{reward.claimed ? 'Claimed' : reward.unlockedAt ? 'Ready to claim' : 'Locked'}</span>
        <button type="button" className={s.deleteReward} aria-label={`Delete ${reward.name}`} onClick={() => dispatch({ type: 'DELETE_REWARD', id: reward.id })}>×</button>
    </article>);
    const availableRewards = state.rewards.filter(reward => !reward.claimed);
    const claimedRewards = state.rewards.filter(reward => reward.claimed);
    return <div className={s.page}>
        <section>
            <div className={s.heading}><div><h1 className="section-title">Rewards</h1><p className={s.intro}>Set personal rewards to celebrate your progress.</p></div><button type="button" className="btn" onClick={() => setAddingReward(true)}>＋ Add Reward</button></div>
            {!state.rewards.length && <div className={s.empty}><p>No rewards yet. Create a reward tied to a goal you care about.</p><button type="button" className="btn" onClick={() => setAddingReward(true)}>Add your first reward</button></div>}
            {availableRewards.length > 0 && <div className={s.rewardGrid}>{rewardCards(availableRewards)}</div>}
            {claimedRewards.length > 0 && <div className={s.claimedRewards}><h2 className="section-title">Claimed Rewards</h2><div className={s.rewardGrid}>{rewardCards(claimedRewards)}</div></div>}
        </section>
        <section>
            <h1 className="section-title">Milestones</h1>
            <p className={s.intro}>Earn badges by building your habits, skills, and experience.</p>
            <div className={s.milestones}>{state.milestones.map(milestone => <MilestoneBadge key={milestone.id} milestone={milestone} state={state} onClick={() => setDialog({ type: 'milestone', item: milestone })} />)}</div>
        </section>
        <section className={s.portfolio}>
            <div className={s.heading}><div><h2 className="section-title">Portfolio</h2><p className={s.intro}>Keep a record of the things you are proud of.</p></div><button className="btn" type="button" onClick={() => setAdding(true)}>＋ Add Achievement</button></div>
            {!state.portfolio.length ? <div className={s.empty}><p>Your portfolio is empty. Add a personal win, project, or milestone.</p><button className="btn" type="button" onClick={() => setAdding(true)}>Add your first achievement</button></div> :
                <div className={s.portfolioGrid}>{state.portfolio.map(entry => <AchievementBadge key={entry.id} entry={entry} onClick={() => setDialog({ type: 'portfolio', item: entry })} />)}</div>}
        </section>
        {adding && <Modal title="Add Achievement" onClose={() => setAdding(false)}><AddAchievementForm onAdd={addEntry} onCancel={() => setAdding(false)} /></Modal>}
        {addingReward && <Modal title="Add Reward" onClose={() => setAddingReward(false)}><AddRewardForm onAdd={payload => { dispatch({ type: 'ADD_REWARD', payload }); setAddingReward(false) }} onCancel={() => setAddingReward(false)} /></Modal>}
        {dialog?.type === 'milestone' && <Modal title={dialog.item.name} onClose={() => setDialog(null)}>
            <div className={s.detail}><p>{dialog.item.condition || dialog.item.description}</p>
                <div className={s.meter}><span style={{ width: `${progress.percent}%` }} /></div>
                <p>{dialog.item.unlocked ? `Unlocked ${new Date(dialog.item.unlockedAt).toLocaleDateString()}` : `${progress.current} / ${progress.target} · ${progress.percent}% complete`}</p>
            </div>
        </Modal>}
        {dialog?.type === 'portfolio' && <Modal title={dialog.item.title} onClose={() => setDialog(null)}>
            <div className={s.detail}>
                {dialog.item.image && <img className={s.largeImage} src={dialog.item.image} alt={dialog.item.title} />}
                <p>{dialog.item.description || 'A meaningful achievement in your journey.'}</p>
                <p><strong>Date:</strong> {dialog.item.date} · <strong>Category:</strong> {dialog.item.category}</p>
                <button type="button" className={s.delete} onClick={() => deleteEntry(dialog.item)}>Delete Achievement</button>
            </div>
        </Modal>}
    </div>
}
