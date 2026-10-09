// Milestone tile with SVG completion ring. Teaches: SVG and derived progress.
import { milestoneProgress } from '../utils/milestones.js';
import s from './MilestoneBadge.module.css';

export default function MilestoneBadge({ milestone, state, onClick }) {
    const progress = milestoneProgress(milestone, state);
    const circumference = 2 * Math.PI * 18;
    const offset = circumference * (1 - progress.percent / 100);
    return <button type="button" className={`card ${s.badge} ${milestone.unlocked ? s.unlocked : s.locked}`} onClick={onClick}>
        <span className={s.ring}>
            <svg viewBox="0 0 44 44" aria-hidden="true">
                <circle className={s.track} cx="22" cy="22" r="18" />
                <circle className={s.progress} cx="22" cy="22" r="18" strokeDasharray={circumference} strokeDashoffset={milestone.unlocked ? 0 : offset} />
            </svg><span>{milestone.unlocked ? '★' : `${progress.percent}%`}</span>
        </span>
        <strong>{milestone.name}</strong><small>{milestone.unlocked ? 'Unlocked' : `${progress.percent}% complete`}</small>
    </button>
}
