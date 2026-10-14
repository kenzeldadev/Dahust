// Initial state, milestone rules, reducer. Teaches: useReducer + immutability.
import { newId } from '../utils/id.js';
import { isSameDay, daysBetween } from '../utils/dates.js';
import { levelFromXp } from '../utils/xp.js';
import { isCompletedHistoryEntry } from '../utils/history.js';

const monthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const defaultTarget = () => ({
  quests: 20,
  xp: 500,
  month: monthKey(new Date()),
});
const notice = (s, type, title, description, icon) => ({
  ...s,
  notifications: [
    {
      id: newId(),
      type,
      title,
      description,
      icon,
      timestamp: new Date().toISOString(),
      read: false,
    },
    ...(s.notifications || []),
  ].slice(0, 50),
});

export const MILESTONE_DEFS = [
  [
    'first_blood',
    'First Blood',
    'Complete your first quest',
    (s) => s.history.filter(isCompletedHistoryEntry).length >= 1,
  ],
  [
    'streak7',
    '7-Day Streak',
    'Reach a 7-day streak',
    (s) => s.user.bestStreak >= 7,
  ],
  [
    'streak30',
    '30-Day Streak',
    'Reach a 30-day streak',
    (s) => s.user.bestStreak >= 30,
  ],
  [
    'xp1000',
    'First 1,000 XP',
    'Earn 1,000 total XP',
    (s) => s.user.totalXp >= 1000,
  ],
  [
    'lv10',
    'Reach Level 10',
    'Reach level 10',
    (s) => levelFromXp(s.user.totalXp, s.rules) >= 10,
  ],
  [
    'lv25',
    'Reach Level 25',
    'Reach level 25',
    (s) => levelFromXp(s.user.totalXp, s.rules) >= 25,
  ],
  [
    'lv50',
    'Reach Level 50',
    'Reach level 50',
    (s) => levelFromXp(s.user.totalXp, s.rules) >= 50,
  ],
  [
    'q100',
    '100 Quests',
    'Complete 100 quests',
    (s) => s.history.filter(isCompletedHistoryEntry).length >= 100,
  ],
  [
    'q500',
    '500 Quests',
    'Complete 500 quests',
    (s) => s.history.filter(isCompletedHistoryEntry).length >= 500,
  ],
  [
    'legend',
    'Legendary Slayer',
    'Complete a Legendary quest',
    (s) =>
      s.history.some(
        (h) => isCompletedHistoryEntry(h) && h.difficulty === 'Legendary',
      ),
  ],
  [
    'skills5',
    'Skill Collector',
    'Create 5 skills',
    (s) => s.skills.length >= 5,
  ],
  [
    'port10',
    'Portfolio Master',
    'Add 10 portfolio entries',
    (s) => s.portfolio.length >= 10,
  ],
];
// Conditions are functions (not JSON-safe), so they live here and milestones in state store only the key.
const CHECKS = Object.fromEntries(MILESTONE_DEFS.map((d) => [d[0], d[3]]));

export const makeInitialState = () => ({
  user: {
    name: 'Player',
    subtitle: 'New challenger',
    avatar: null,
    totalXp: 0,
    streak: 0,
    bestStreak: 0,
    daysActive: 0,
    lastActiveDate: null,
    lifeStages: [],
  },
  rules: {
    maxLevel: 100,
    curveBase: 100,
    curveExponent: 1.5,
    difficultyXp: {
      Trivial: 5,
      Easy: 15,
      Medium: 40,
      Hard: 100,
      Epic: 250,
      Legendary: 500,
    },
  },
  skills: [],
  quests: [],
  history: [],
  portfolio: [],
  rewards: [],
  notifications: [],
  milestones: MILESTONE_DEFS.map(([key, name, description]) => ({
    id: key,
    key,
    name,
    description,
    condition: description,
    icon: 'Trophy',
    unlocked: false,
    unlockedAt: null,
  })),
});

function rewardConditionMet(reward, s) {
  const value = Number(reward.conditionValue);
  switch (reward.conditionType) {
    case 'quests_completed_total':
      return s.history.filter(isCompletedHistoryEntry).length >= value;
    case 'quests_completed_today':
      return (
        s.history.filter(
          (entry) =>
            isCompletedHistoryEntry(entry) &&
            isSameDay(entry.timestamp, new Date()),
        ).length >= value
      );
    case 'streak_days':
      return s.user.streak >= value;
    case 'skill_level':
      return s.skills.some((skill) => {
        const xp = s.history
          .filter(
            (entry) =>
              isCompletedHistoryEntry(entry) && entry.skillId === skill.id,
          )
          .reduce((sum, entry) => sum + entry.xp, 0);
        return levelFromXp(xp, s.rules) >= value;
      });
    case 'xp_total':
      return s.user.totalXp >= value;
    default:
      return false;
  }
}

// Unlock reached rewards and milestones while adding persistent feed notices.
function checkAllMilestones(s) {
  const now = new Date().toISOString();
  let next = {
    ...s,
    milestones: s.milestones.map((m) =>
      !m.unlocked && CHECKS[m.key]?.(s)
        ? { ...m, unlocked: true, unlockedAt: now }
        : m,
    ),
  };
  const unlocked = next.milestones.filter(
    (m) =>
      m.unlocked &&
      !s.milestones.find((previous) => previous.id === m.id)?.unlocked,
  );
  unlocked.forEach((m) => {
    next = notice(next, 'milestone', m.name, m.description, 'Trophy');
  });
  const rewards = (next.rewards || []).map((reward) => {
    if (reward.unlockedAt || !rewardConditionMet(reward, next)) return reward;
    next = notice(
      next,
      'reward',
      `Reward unlocked: ${reward.name}`,
      reward.description,
      'Gift',
    );
    return { ...reward, unlockedAt: now, claimed: false };
  });
  return { ...next, rewards };
}

function reduce(s, a) {
  switch (a.type) {
    case 'UPDATE_USER':
      return { ...s, user: { ...s.user, ...a.payload } };
    case 'UPDATE_RULES': {
      const rules = {
        ...s.rules,
        ...a.payload,
        difficultyXp: { ...s.rules.difficultyXp, ...a.payload.difficultyXp },
      };
      return {
        ...s,
        rules,
        quests: s.quests.map((q) =>
          q.completed
            ? q
            : { ...q, xp: rules.difficultyXp[q.difficulty] ?? q.xp },
        ),
      };
    }
    case 'ADD_SKILL':
      return {
        ...s,
        skills: [
          ...s.skills,
          { id: newId(), monthlyTarget: defaultTarget(), ...a.payload },
        ],
      };
    case 'UPDATE_SKILL':
      return {
        ...s,
        skills: s.skills.map((k) =>
          k.id === a.id ? { ...k, ...a.payload } : k,
        ),
      };
    case 'SET_SKILL_TARGET':
      return {
        ...s,
        skills: s.skills.map((k) =>
          k.id === a.id
            ? {
                ...k,
                monthlyTarget: {
                  ...defaultTarget(),
                  ...k.monthlyTarget,
                  ...a.payload,
                  month: monthKey(new Date()),
                },
              }
            : k,
        ),
      };
    case 'DELETE_SKILL':
      return { ...s, skills: s.skills.filter((k) => k.id !== a.id) };
    case 'ADD_LIFE_STAGE':
      return {
        ...s,
        user: {
          ...s.user,
          lifeStages: [
            ...(s.user.lifeStages || []),
            { id: newId(), level: 1, name: 'New stage', age: 0, ...a.payload },
          ],
        },
      };
    case 'UPDATE_LIFE_STAGE':
      return {
        ...s,
        user: {
          ...s.user,
          lifeStages: (s.user.lifeStages || []).map((stage) =>
            stage.id === a.id ? { ...stage, ...a.payload } : stage,
          ),
        },
      };
    case 'DELETE_LIFE_STAGE':
      return {
        ...s,
        user: {
          ...s.user,
          lifeStages: (s.user.lifeStages || []).filter(
            (stage) => stage.id !== a.id,
          ),
        },
      };
    case 'ADD_QUEST':
      return {
        ...s,
        quests: [
          ...s.quests,
          {
            id: newId(),
            ...a.payload,
            xp: s.rules.difficultyXp[a.payload.difficulty],
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString(),
          },
        ],
      };
    case 'DELETE_QUEST':
      return { ...s, quests: s.quests.filter((q) => q.id !== a.id) };
    case 'RECORD_MISSED_QUESTS': {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const missed = s.quests.filter(
        (q) =>
          !q.completed &&
          new Date(q.createdAt) < today &&
          !s.history.some(
            (entry) => entry.questId === q.id && entry.status === 'missed',
          ),
      );
      if (!missed.length) return s;
      const entries = missed.map((q) => {
        const missedOn = new Date(q.createdAt);
        missedOn.setDate(missedOn.getDate() + 1);
        missedOn.setHours(0, 0, 0, 0);
        return {
          id: newId(),
          questId: q.id,
          title: q.title,
          difficulty: q.difficulty,
          xp: 0,
          skillId: q.skillId,
          timestamp: missedOn.toISOString(),
          description:
            'This quest was missed. It is still available to make up.',
          status: 'missed',
        };
      });
      const missedIds = new Set(missed.map((q) => q.id));
      return {
        ...s,
        quests: s.quests.map((q) =>
          missedIds.has(q.id)
            ? {
                ...q,
                missedAt: entries.find((entry) => entry.questId === q.id)
                  .timestamp,
              }
            : q,
        ),
        history: [...entries, ...s.history],
      };
    }
    case 'COMPLETE_QUEST': {
      const q = s.quests.find((x) => x.id === a.id);
      if (!q || q.completed) return s;
      const now = new Date().toISOString(),
        u = s.user;
      let next = s;
      let streak = u.streak,
        days = u.daysActive;
      if (!u.lastActiveDate || !isSameDay(u.lastActiveDate, now)) {
        // first completion today
        const gap = u.lastActiveDate
          ? daysBetween(u.lastActiveDate, now)
          : null;
        if (gap != null && gap > 1 && u.streak > 0)
          next = notice(
            next,
            'streak',
            'Streak broken',
            `Your ${u.streak}-day streak ended. Every new day is a fresh start.`,
            'Flame',
          );
        streak = gap === 1 ? u.streak + 1 : 1;
        days++;
        if (!u.lastActiveDate || gap > 1)
          next = notice(
            next,
            'streak',
            'Streak started',
            'You completed a quest today. Keep it going tomorrow!',
            'Flame',
          );
      }
      next = {
        ...next,
        quests: next.quests.map((x) =>
          x.id === q.id ? { ...x, completed: true, completedAt: now } : x,
        ),
        history: [
          {
            id: newId(),
            questId: q.id,
            title: q.title,
            difficulty: q.difficulty,
            xp: q.xp,
            skillId: q.skillId,
            timestamp: now,
            description: '',
            status: 'completed',
          },
          ...next.history,
        ],
        user: {
          ...u,
          totalXp: u.totalXp + q.xp,
          streak,
          bestStreak: Math.max(u.bestStreak, streak),
          daysActive: days,
          lastActiveDate: now,
        },
      };
      const skill = next.skills.find((item) => item.id === q.skillId);
      if (skill?.monthlyTarget?.month === monthKey(new Date(now))) {
        const entries = next.history.filter(
          (entry) =>
            isCompletedHistoryEntry(entry) &&
            entry.skillId === skill.id &&
            monthKey(new Date(entry.timestamp)) === skill.monthlyTarget.month,
        );
        const previousEntries = entries.filter(
          (entry) => entry.questId !== q.id,
        );
        const target = skill.monthlyTarget;
        const justMetQuests =
          target.quests > 0 &&
          previousEntries.length < target.quests &&
          entries.length >= target.quests;
        const previousXp = previousEntries.reduce(
          (sum, entry) => sum + entry.xp,
          0,
        );
        const currentXp = entries.reduce((sum, entry) => sum + entry.xp, 0);
        const justMetXp =
          target.xp > 0 && previousXp < target.xp && currentXp >= target.xp;
        if (justMetQuests || justMetXp)
          next = notice(
            next,
            'target',
            `${skill.name} monthly target met`,
            justMetQuests
              ? `${entries.length} quests completed this month.`
              : `${currentXp} XP earned this month.`,
            'Target',
          );
      }
      return next;
    }
    case 'UNCOMPLETE_QUEST': {
      const q = s.quests.find((x) => x.id === a.id);
      if (!q || !q.completed) return s;
      // Streak/days aren't rewound (can't know prior state); XP and history are.
      return {
        ...s,
        quests: s.quests.map((x) =>
          x.id === q.id ? { ...x, completed: false, completedAt: null } : x,
        ),
        history: s.history.filter(
          (h) => h.questId !== q.id || h.status === 'missed',
        ),
        user: { ...s.user, totalXp: Math.max(0, s.user.totalXp - q.xp) },
      };
    }
    case 'ADD_PORTFOLIO_ENTRY':
      return {
        ...s,
        portfolio: [{ id: newId(), ...a.payload }, ...s.portfolio],
      };
    case 'DELETE_PORTFOLIO_ENTRY':
      return { ...s, portfolio: s.portfolio.filter((p) => p.id !== a.id) };
    case 'UNLOCK_MILESTONE':
      return {
        ...s,
        milestones: s.milestones.map((m) =>
          m.id === a.id
            ? { ...m, unlocked: true, unlockedAt: new Date().toISOString() }
            : m,
        ),
      };
    case 'ADD_REWARD':
      return {
        ...s,
        rewards: [
          ...(s.rewards || []),
          { id: newId(), unlockedAt: null, claimed: false, ...a.payload },
        ],
      };
    case 'CLAIM_REWARD':
      return {
        ...s,
        rewards: (s.rewards || []).map((reward) =>
          reward.id === a.id && reward.unlockedAt
            ? { ...reward, claimed: true, claimedAt: new Date().toISOString() }
            : reward,
        ),
      };
    case 'DELETE_REWARD':
      return {
        ...s,
        rewards: (s.rewards || []).filter((reward) => reward.id !== a.id),
      };
    case 'ADD_NOTIFICATION':
      return notice(
        s,
        a.payload.type,
        a.payload.title,
        a.payload.description,
        a.payload.icon,
      );
    case 'MARK_NOTIFICATION_READ':
      return {
        ...s,
        notifications: (s.notifications || []).map((item) =>
          item.id === a.id ? { ...item, read: true } : item,
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...s,
        notifications: (s.notifications || []).map((item) => ({
          ...item,
          read: true,
        })),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...s, notifications: [] };
    case 'IMPORT':
      return a.payload;
    case 'RESET_ALL':
      return makeInitialState();
    default:
      return s;
  }
}
// Every action passes through the milestone check.
export const gameReducer = (s, a) => checkAllMilestones(reduce(s, a));
