// Avatar, editable name/subtitle, XP bar, stat chips. Teaches: controlled inputs + derived data.
import { useState, useRef } from 'react';
import useGame from '../hooks/useGame.js';
import { levelFromXp, xpIntoCurrentLevel, xpNeededForLevel, progressPercent } from '../utils/xp.js';
import s from './HeroCard.module.css';
function Editable({ value, onSave, className }) {
  const [edit, setEdit] = useState(false); const [v, setV] = useState(value);
  const save = () => { setEdit(false); if (v.trim()) onSave(v.trim()); else setV(value) };
  return edit ? <input autoFocus className={`input ${className}`} value={v} onChange={e => setV(e.target.value)} onBlur={save} onKeyDown={e => e.key === 'Enter' && save()} />
    : <span className={className} onClick={() => { setV(value); setEdit(true) }}>{value}</span>
}
export default function HeroCard() {
  const { state, dispatch } = useGame(); const { user, rules } = state; const file = useRef();
  const lv = levelFromXp(user.totalXp, rules), pct = progressPercent(user.totalXp, rules);
  const onFile = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => dispatch({ type: 'UPDATE_USER', payload: { avatar: r.result } }); r.readAsDataURL(f) };
  return <section className={`card ${s.hero}`}>
    <div className={s.avatar} onClick={() => file.current.click()} style={user.avatar ? { backgroundImage: `url(${user.avatar})` } : {}}>
      {!user.avatar && user.name[0]?.toUpperCase()}<span className={s.lv}>LV {lv}</span>
      <input ref={file} type="file" accept="image/*" hidden onChange={onFile} /></div>
    <div className={s.info}>
      <Editable className={s.name} value={user.name} onSave={name => dispatch({ type: 'UPDATE_USER', payload: { name } })} />
      <Editable className={s.sub} value={user.subtitle} onSave={subtitle => dispatch({ type: 'UPDATE_USER', payload: { subtitle } })} />
      <div className={s.bar}><div className={s.fill} style={{ width: `${pct}%` }} /></div>
      <div className={s.label}>{lv >= rules.maxLevel ? 'MAX LEVEL' : `${xpIntoCurrentLevel(user.totalXp, rules)} / ${xpNeededForLevel(lv, rules)} XP · ${Math.floor(pct)}% to LV ${lv + 1}`}</div>
      <div className={s.chips}><span>🔥 {user.streak} streak</span><span>⭐ {user.totalXp} XP</span><span>📅 {user.daysActive} days</span></div>
    </div></section>
}
