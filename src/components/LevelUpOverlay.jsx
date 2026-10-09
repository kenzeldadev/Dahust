// Full-screen level-up celebration. Teaches: conditional rendering + timed effects.
import s from './LevelUpOverlay.module.css';

export default function LevelUpOverlay({ level }) {
    if (level == null) return null;
    return <div className={s.flash} role="status" aria-live="assertive">
        <div className={s.content}><span>LEVEL UP</span><strong>LV {level}</strong></div>
    </div>
}
