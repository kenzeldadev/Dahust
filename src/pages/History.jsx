// Reverse-chronological quest completion timeline. Teaches: sorting and detail dialogs.
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import useGame from '../hooks/useGame.js';
import { daysBetween, isSameDay, relativeTime } from '../utils/dates.js';
import s from './History.module.css';

const dayLabel = (value) => {
  const date = new Date(value),
    today = new Date();
  if (isSameDay(date, today)) return 'Today';
  if (daysBetween(date, today) === 1) return 'Yesterday';
  const day = date.getDate(),
    remainder = day % 100;
  const suffix =
    remainder >= 11 && remainder <= 13
      ? 'th'
      : { 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] || 'th';
  return `${date.toLocaleDateString(undefined, { month: 'long' })} ${day}${suffix}`;
};
const localDayStart = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export default function History() {
  const { state, dispatch } = useGame();
  const [selected, setSelected] = useState(null);
  const [skillFilter, setSkillFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [range, setRange] = useState('all');
  const entries = useMemo(() => {
    const now = new Date(),
      today = localDayStart(now);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return [...state.history]
      .filter((entry) => {
        if (skillFilter === 'none' && entry.skillId) return false;
        if (
          skillFilter === 'unknown' &&
          (!entry.skillId ||
            state.skills.some((skill) => skill.id === entry.skillId))
        )
          return false;
        if (
          skillFilter !== 'all' &&
          skillFilter !== 'none' &&
          skillFilter !== 'unknown' &&
          entry.skillId !== skillFilter
        )
          return false;
        if (difficultyFilter !== 'all' && entry.difficulty !== difficultyFilter)
          return false;
        const time = new Date(entry.timestamp);
        if (range === 'week' && (time < weekStart || time > now)) return false;
        if (range === 'month' && (time < monthStart || time > now))
          return false;
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [state.history, state.skills, skillFilter, difficultyFilter, range]);
  const groups = [];
  entries.forEach((entry) => {
    let group = groups.find((item) => isSameDay(item.date, entry.timestamp));
    if (!group) {
      group = { date: entry.timestamp, entries: [] };
      groups.push(group);
    }
    group.entries.push(entry);
  });
  const skillOf = (id) => state.skills.find((skill) => skill.id === id);
  return (
    <section>
      <h1 className="section-title">Quest History</h1>
      <div className={s.filters}>
        <label>
          Skill
          <select
            className="input"
            value={skillFilter}
            onChange={(event) => setSkillFilter(event.target.value)}
          >
            <option value="all">All skills</option>
            {state.skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
            <option value="none">No skill</option>
            {state.history.some(
              (entry) => entry.skillId && !skillOf(entry.skillId),
            ) && <option value="unknown">Unknown skill</option>}
          </select>
        </label>
        <label>
          Difficulty
          <select
            className="input"
            value={difficultyFilter}
            onChange={(event) => setDifficultyFilter(event.target.value)}
          >
            <option value="all">All difficulties</option>
            {Object.keys(state.rules.difficultyXp).map((difficulty) => (
              <option key={difficulty}>{difficulty}</option>
            ))}
          </select>
        </label>
        <div className={s.range} aria-label="History time range">
          {[
            ['week', 'This week'],
            ['month', 'This month'],
            ['all', 'All time'],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              className={range === value ? s.activeRange : ''}
              aria-pressed={range === value}
              onClick={() => setRange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {!entries.length ? (
        <div className={s.empty}>
          <p>
            {state.history.length
              ? 'No history matches these filters.'
              : 'No history yet. Complete a quest to see it here.'}
          </p>
          {state.history.length ? (
            <button
              className="btn"
              type="button"
              onClick={() => {
                setSkillFilter('all');
                setDifficultyFilter('all');
                setRange('all');
              }}
            >
              Clear filters
            </button>
          ) : (
            <Link className="btn" to="/">
              Go to Profile
            </Link>
          )}
        </div>
      ) : (
        <div className={s.timeline}>
          {groups.map((group) => (
            <section className={s.group} key={group.date}>
              <h2 className={s.dateHeading}>{dayLabel(group.date)}</h2>
              {group.entries.map((entry) => {
                const skill = skillOf(entry.skillId);
                const skillName = entry.skillId
                  ? skill?.name || 'Unknown skill'
                  : 'No skill';
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={s.entry}
                    onClick={() => setSelected(entry)}
                  >
                    <span className={s.dot} />
                    <span className={s.card}>
                      <span className={s.top}>
                        <strong>{entry.title}</strong>
                        <b
                          className={
                            entry.status === 'missed' ? s.missedStatus : ''
                          }
                        >
                          {entry.status === 'missed'
                            ? 'Missed · Make-up available'
                            : `+${entry.xp} XP`}
                        </b>
                      </span>
                      <span className={s.meta}>
                        <i style={{ color: skill?.color || 'var(--muted)' }}>
                          {skillName}
                        </i>
                        <em>{entry.difficulty}</em>
                        <time>{relativeTime(entry.timestamp)}</time>
                      </span>
                    </span>
                  </button>
                );
              })}
            </section>
          ))}
        </div>
      )}
      {selected && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <div className={s.detail}>
            <p>
              {selected.description ||
                (selected.status === 'missed'
                  ? 'This quest was missed, but you can still make it up.'
                  : 'Quest completed and added to your journey.')}
            </p>
            <p>
              <strong>Skill:</strong>{' '}
              {selected.skillId
                ? skillOf(selected.skillId)?.name || 'Unknown skill'
                : 'No skill'}
            </p>
            <p>
              <strong>Difficulty:</strong> {selected.difficulty}
            </p>
            <p>
              <strong>
                {selected.status === 'missed' ? 'Missed on:' : 'Completed:'}
              </strong>{' '}
              {new Date(selected.timestamp).toLocaleString()}
            </p>
            {selected.status === 'missed' ? (
              state.quests.some(
                (quest) => quest.id === selected.questId && !quest.completed,
              ) ? (
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    dispatch({ type: 'COMPLETE_QUEST', id: selected.questId });
                    setSelected(null);
                  }}
                >
                  Make up this quest
                </button>
              ) : (
                <strong className={s.reward}>
                  This quest is no longer available.
                </strong>
              )
            ) : (
              <strong className={s.reward}>+{selected.xp} XP</strong>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}
