// Persistent announcements drawer and reward claim popup. Teaches: context-driven overlays.
import { Bell, Flame, Gift, Target, TrendingUp, Trophy, X } from 'lucide-react';
import { useState } from 'react';
import Modal from './Modal.jsx';
import useGame from '../hooks/useGame.js';
import s from './NotificationFeed.module.css';

const icons = { Flame, Gift, Target, TrendingUp, Trophy };

export default function NotificationFeed() {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const unread = state.notifications.filter((item) => !item.read).length;
  const [dismissedReward, setDismissedReward] = useState(null);
  const pendingReward = state.rewards.find(
    (reward) =>
      reward.unlockedAt && !reward.claimed && reward.id !== dismissedReward,
  );
  const markRead = (id) => dispatch({ type: 'MARK_NOTIFICATION_READ', id });
  return (
    <>
      <button
        type="button"
        className={s.bell}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className={s.count}>{unread > 99 ? '99+' : unread}</span>
        )}
      </button>
      {open && (
        <div className={s.drawerLayer}>
          <button
            type="button"
            className={s.scrim}
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <aside className={s.drawer} aria-label="Notifications">
            <header className={s.header}>
              <div>
                <h2>Announcements</h2>
                <span>{unread} unread</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
              >
                <X size={18} />
              </button>
            </header>
            <div className={s.toolbar}>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })
                }
              >
                Mark all read
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
              >
                Clear all
              </button>
            </div>
            <div className={s.list}>
              {state.notifications.length ? (
                state.notifications.map((item) => {
                  const Icon = icons[item.icon] || Bell;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={`${s.item} ${item.read ? '' : s.unread}`}
                      onClick={() => markRead(item.id)}
                    >
                      <span className={s.itemIcon}>
                        <Icon size={17} />
                      </span>
                      <span className={s.itemText}>
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                        <time>{new Date(item.timestamp).toLocaleString()}</time>
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className={s.empty}>
                  No announcements yet. Your progress updates will appear here.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
      {pendingReward && (
        <Modal
          title="Reward Unlocked!"
          onClose={() => setDismissedReward(pendingReward.id)}
        >
          <div className={s.rewardPopup}>
            <span>
              <Gift size={34} />
            </span>
            <h3>{pendingReward.name}</h3>
            <p>
              {pendingReward.description ||
                'You reached your reward condition. Nice work!'}
            </p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                dispatch({ type: 'CLAIM_REWARD', id: pendingReward.id });
                setDismissedReward(null);
              }}
            >
              Claim Reward
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
