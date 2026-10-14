// Portfolio entry tile. Teaches: data-driven image and text rendering.
import { CalendarDays } from 'lucide-react';
import s from './AchievementBadge.module.css';

export default function AchievementBadge({ entry, onClick }) {
  return (
    <button type="button" className={`card ${s.badge}`} onClick={onClick}>
      {entry.image ? (
        <img className={s.image} src={entry.image} alt="" />
      ) : (
        <div className={s.noImage}>✦</div>
      )}
      <span className={s.title}>{entry.title}</span>
      <span className={s.meta}>
        <CalendarDays size={14} />
        {entry.date}
        <i>{entry.category}</i>
      </span>
    </button>
  );
}
