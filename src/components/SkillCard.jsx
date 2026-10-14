// Compact colored skill tile for the profile. Teaches: reusable presentational components.
import { SKILL_ICONS } from './AddSkillForm.jsx';
import { Link } from 'react-router-dom';
import s from './SkillCard.module.css';

export default function SkillCard({ skill }) {
  const Icon = SKILL_ICONS[skill.icon] || SKILL_ICONS.Star;
  return (
    <Link
      to={`/skills/${skill.id}`}
      className={`card ${s.card}`}
      style={{ borderTopColor: skill.color }}
      aria-label={`View ${skill.name} skill`}
    >
      <span
        className={s.icon}
        style={{ color: skill.color, backgroundColor: `${skill.color}20` }}
      >
        <Icon size={21} aria-hidden="true" />
      </span>
      <strong>{skill.name}</strong>
    </Link>
  );
}
