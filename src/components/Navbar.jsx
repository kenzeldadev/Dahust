// Top nav with active-link underline. Teaches: NavLink className callback.
import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import SettingsModal from './SettingsModal.jsx';
import NotificationFeed from './NotificationFeed.jsx';
import s from './Navbar.module.css';
const links = [
  ['/', 'Profile'],
  ['/history', 'History'],
  ['/skills', 'Skills'],
  ['/achievements', 'Achievements'],
  ['/stats', 'Stats'],
];
export default function Navbar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <>
      <nav className={s.nav}>
        <span className={s.logo}>DAHUST</span>
        <div className={s.links}>
          {links.map(([to, l]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${s.link} ${isActive ? s.active : ''}`
              }
            >
              {l}
            </NavLink>
          ))}
        </div>
        <div className={s.tools}>
          <NotificationFeed />
          <button
            type="button"
            className={s.gear}
            aria-label="Open settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={20} />
          </button>
        </div>
      </nav>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
