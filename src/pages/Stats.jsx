// Derived account analytics using CSS bars and native SVG charts. Teaches: aggregation + SVG.
import { Link } from 'react-router-dom';
import { useState } from 'react';
import useGame from '../hooks/useGame.js';
import { isCompletedHistoryEntry } from '../utils/history.js';
import { isSameDay } from '../utils/dates.js';
import s from './Stats.module.css';

const toDayKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const addDays = (date, days) => { const next = new Date(date); next.setDate(next.getDate() + days); return next };
const polar = (cx, cy, radius, angle) => [cx + Math.sin(angle) * radius, cy - Math.cos(angle) * radius];

function Radar({ skills, values, label }) {
    const cx = 130, cy = 118, radius = 86;
    const max = Math.max(0, ...skills.map(skill => values[skill.id] || 0));
    const points = skills.map((skill, index) => {
        const angle = Math.PI * 2 * index / skills.length;
        const ratio = max ? (values[skill.id] || 0) / max : 0;
        const [x, y] = polar(cx, cy, radius * ratio, angle);
        const [ax, ay] = polar(cx, cy, radius, angle);
        return { x, y, ax, ay, skill, angle }
    });
    const polygon = points.map(point => `${point.x},${point.y}`).join(' ');
    return <svg className={s.radar} viewBox="0 0 260 240" role="img" aria-label={`${label} XP by skill radar chart`}>
        {[.25, .5, .75, 1].map(ring => <circle key={ring} cx={cx} cy={cy} r={radius * ring} fill="none" stroke="var(--border)" />)}
        {points.map((point, index) => <g key={point.skill.id}>
            <line x1={cx} y1={cy} x2={point.ax} y2={point.ay} stroke="var(--border)" />
            <text x={cx + Math.sin(point.angle) * 108} y={cy - Math.cos(point.angle) * 108} textAnchor="middle" dominantBaseline="middle" className={s.axisLabel}>{point.skill.name.slice(0, 12)}</text>
            {(skills.length < 3) && <line x1={cx} y1={cy} x2={point.x} y2={point.y} stroke={point.skill.color} strokeWidth="3" />}
            {(skills.length < 3) && <circle cx={point.x} cy={point.y} r="4" fill={point.skill.color} />}
        </g>)}
        {skills.length >= 3 && <polygon points={polygon} fill="rgba(34,211,238,.2)" stroke="var(--cyan)" strokeWidth="2" />}
    </svg>
}

function Donut({ slices, total }) {
    const circumference = 2 * Math.PI * 78;
    let offset = 0;
    return <svg className={s.donut} viewBox="0 0 220 220" role="img" aria-label="XP by skill donut chart">
        <circle cx="110" cy="110" r="78" fill="none" stroke="var(--surface-2)" strokeWidth="28" />
        {total > 0 && slices.map(slice => {
            const length = circumference * slice.xp / total;
            const circle = <circle key={slice.key} cx="110" cy="110" r="78" fill="none" stroke={slice.color} strokeWidth="28" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} transform="rotate(-90 110 110)" />;
            offset += length;
            return circle
        })}
        <text x="110" y="105" textAnchor="middle" className={s.donutTotal}>{total}</text>
        <text x="110" y="127" textAnchor="middle" className={s.donutLabel}>TOTAL XP</text>
    </svg>
}

export default function Stats() {
    const { state } = useGame();
    const { skills, user } = state;
    const history = state.history.filter(isCompletedHistoryEntry);
    const [radarRange, setRadarRange] = useState('today');
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(todayStart.getDate() - ((todayStart.getDay() + 6) % 7));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const radarHistory = history.filter(entry => {
        const date = new Date(entry.timestamp);
        if (radarRange === 'today') return isSameDay(date, now);
        if (radarRange === 'week') return date >= weekStart && date <= now;
        if (radarRange === 'month') return date >= monthStart && date <= now;
        return true
    });
    const sumBySkill = entries => Object.fromEntries(skills.map(skill => [skill.id, entries.filter(entry => entry.skillId === skill.id).reduce((sum, entry) => sum + entry.xp, 0)]));
    const selectedTotals = sumBySkill(radarHistory);
    const lifetimeTotals = sumBySkill(history);
    const weekDays = Array.from({ length: 7 }, (_, index) => addDays(now, index - 6));
    const dailyXp = new Map();
    history.forEach(entry => {
        const key = toDayKey(new Date(entry.timestamp));
        dailyXp.set(key, (dailyXp.get(key) || 0) + entry.xp)
    });
    const weekValues = weekDays.map(date => ({ date, xp: dailyXp.get(toDayKey(date)) || 0 }));
    const weekMax = Math.max(1, ...weekValues.map(item => item.xp));
    const mondayOffset = (now.getDay() + 6) % 7;
    const gridStart = addDays(now, -mondayOffset - (11 * 7));
    const activity = Array.from({ length: 84 }, (_, index) => {
        const date = addDays(gridStart, index);
        const xp = dailyXp.get(toDayKey(date)) || 0;
        return { date, xp }
    });
    const activityMax = Math.max(1, ...activity.map(day => day.xp));
    const slices = skills.map(skill => ({ key: skill.id, label: skill.name, xp: lifetimeTotals[skill.id], color: skill.color }))
        .filter(slice => slice.xp > 0);
    const knownIds = new Set(skills.map(skill => skill.id));
    const unknownXp = history.filter(entry => entry.skillId && !knownIds.has(entry.skillId)).reduce((sum, entry) => sum + entry.xp, 0);
    const unassignedXp = history.filter(entry => !entry.skillId).reduce((sum, entry) => sum + entry.xp, 0);
    if (unknownXp) slices.push({ key: 'unknown', label: 'Unknown skill', xp: unknownXp, color: 'var(--muted)' });
    if (unassignedXp) slices.push({ key: 'unassigned', label: 'No skill', xp: unassignedXp, color: 'var(--muted)' });
    const totalHistoryXp = history.reduce((sum, entry) => sum + entry.xp, 0);
    return <div className={s.page}>
        <div><h1 className="section-title">Stats & Analytics</h1><p className={s.intro}>A clear view of the progress you have made.</p></div>
        {!history.length && <div className={s.empty}><p>Your stats will grow as you complete quests.</p><Link className="btn" to="/">Create your first quest</Link></div>}
        <div className={s.statGrid}>
            <article className={`card ${s.stat}`}><span>Total XP</span><strong>{user.totalXp.toLocaleString()}</strong></article>
            <article className={`card ${s.stat}`}><span>Current Streak</span><strong>{user.streak} days</strong></article>
            <article className={`card ${s.stat}`}><span>Best Streak</span><strong>{user.bestStreak} days</strong></article>
            <article className={`card ${s.stat}`}><span>Quests Completed</span><strong>{history.length.toLocaleString()}</strong></article>
        </div>
        <section className={`card ${s.chartCard}`}>
            <h2 className="section-title">XP This Week</h2>
            <div className={s.bars}>{weekValues.map(({ date, xp }) => <div className={s.barColumn} key={toDayKey(date)} title={`${date.toLocaleDateString()}: ${xp} XP`}>
                <strong>{xp || ''}</strong><div className={s.barTrack}><div className={s.bar} style={{ height: `${xp ? Math.max(5, xp / weekMax * 100) : 0}%` }} /></div><small>{date.toLocaleDateString(undefined, { weekday: 'short' })}</small>
            </div>)}</div>
        </section>
        <div className={s.chartGrid}>
            <section className={`card ${s.chartCard}`}>
                <div className={s.radarHeading}><h2 className="section-title">{radarRange === 'today' ? 'Today' : radarRange === 'week' ? 'This Week' : radarRange === 'month' ? 'This Month' : 'All Time'} · XP by Skill</h2>
                    <div className={s.radarToggle}>{[['today', 'Today'], ['week', 'Week'], ['month', 'Month'], ['all', 'All Time']].map(([value, label]) => <button type="button" key={value} onClick={() => setRadarRange(value)} className={radarRange === value ? s.selectedToggle : ''} aria-pressed={radarRange === value}>{label}</button>)}</div>
                </div>
                {!skills.length ? <p className={s.chartEmpty}>Add a skill to see your balance. <Link to="/skills">Add a skill</Link></p> :
                    <><Radar skills={skills} values={selectedTotals} label={radarRange} />{skills.length < 3 && <p className={s.chartHint}>Add more skills to form a complete radar.</p>}</>}
            </section>
            <section className={`card ${s.chartCard}`}><h2 className="section-title">This Season · All-Time XP</h2>
                {!skills.length ? <p className={s.chartEmpty}>Add a skill to see lifetime balance. <Link to="/skills">Add a skill</Link></p> :
                    <><Radar skills={skills} values={lifetimeTotals} label="This Season" />{skills.length < 3 && <p className={s.chartHint}>Add more skills to form a complete radar.</p>}</>}
            </section>
            <section className={`card ${s.chartCard}`}><h2 className="section-title">XP by Skill</h2>
                {totalHistoryXp === 0 ? <p className={s.chartEmpty}>Complete a quest to build your XP breakdown. <Link to="/">Go to quests</Link></p> :
                    <div className={s.donutWrap}><Donut slices={slices} total={totalHistoryXp} /><ul className={s.legend}>{slices.map(slice => <li key={slice.key}><i style={{ background: slice.color }} />{slice.label}<b>{slice.xp}</b></li>)}</ul></div>}
            </section>
        </div>
        <section className={`card ${s.chartCard}`}>
            <h2 className="section-title">Activity · 12 Weeks</h2>
            <div className={s.heatmap} aria-label="Daily XP activity heatmap">{activity.map(day => {
                const opacity = day.xp ? .2 + .8 * day.xp / activityMax : 0;
                return <span key={toDayKey(day.date)} title={`${day.date.toLocaleDateString()}: ${day.xp} XP`} style={{ backgroundColor: day.xp ? `rgba(34, 211, 238, ${opacity})` : 'var(--surface-2)' }} />
            })}</div>
            <div className={s.heatLegend}><span>Less</span>{[0, .25, .5, .75, 1].map(value => <i key={value} style={{ backgroundColor: value ? `rgba(34, 211, 238, ${value})` : 'var(--surface-2)' }} />)}<span>More</span></div>
        </section>
    </div>
}
