// Validates save files before they replace persistent state. Teaches: runtime data guards.
import { makeInitialState } from '../context/gameReducer.js';

export function validateImportedState(value) {
  const fail = () => {
    throw new Error(
      'Invalid Dahust save: required fields or values are missing.',
    );
  };
  const thisMonth = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail();
  const initial = makeInitialState();
  if (
    !value.user ||
    !value.rules ||
    !Array.isArray(value.skills) ||
    !Array.isArray(value.quests) ||
    !Array.isArray(value.history) ||
    !Array.isArray(value.portfolio) ||
    !Array.isArray(value.milestones)
  )
    fail();
  if (
    typeof value.user.name !== 'string' ||
    typeof value.user.subtitle !== 'string' ||
    !Number.isFinite(value.user.totalXp) ||
    value.user.totalXp < 0 ||
    !['streak', 'bestStreak', 'daysActive'].every(
      (key) => Number.isInteger(value.user[key]) && value.user[key] >= 0,
    ) ||
    !(
      value.user.lastActiveDate === null ||
      typeof value.user.lastActiveDate === 'string'
    ) ||
    !(value.user.avatar === null || typeof value.user.avatar === 'string')
  )
    fail();
  const { maxLevel, curveBase, curveExponent, difficultyXp } = value.rules;
  if (
    !Number.isInteger(maxLevel) ||
    ![maxLevel, curveBase, curveExponent].every(
      (number) => Number.isFinite(number) && number > 0,
    ) ||
    !difficultyXp ||
    !Object.keys(initial.rules.difficultyXp).every(
      (tier) => Number.isFinite(difficultyXp[tier]) && difficultyXp[tier] > 0,
    )
  )
    fail();
  const uniqueIds = (entries) =>
    new Set(entries.map((item) => item.id)).size === entries.length;
  const tiers = Object.keys(initial.rules.difficultyXp);
  const rewards = value.rewards === undefined ? [] : value.rewards;
  const notifications =
    value.notifications === undefined ? [] : value.notifications;
  const lifeStages =
    value.user.lifeStages === undefined ? [] : value.user.lifeStages;
  if (!Array.isArray(rewards) || !Array.isArray(notifications)) fail();
  if (
    !Array.isArray(lifeStages) ||
    !lifeStages.every(
      (stage) =>
        stage &&
        typeof stage.id === 'string' &&
        Number.isInteger(stage.level) &&
        stage.level > 0 &&
        typeof stage.name === 'string' &&
        Number.isInteger(stage.age) &&
        stage.age >= 0,
    )
  )
    fail();
  if (
    !value.skills.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.color === 'string' &&
        typeof item.icon === 'string' &&
        (!item.monthlyTarget ||
          (Number.isInteger(item.monthlyTarget.quests) &&
            item.monthlyTarget.quests >= 0 &&
            Number.isInteger(item.monthlyTarget.xp) &&
            item.monthlyTarget.xp >= 0)),
    ) ||
    !value.quests.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        tiers.includes(item.difficulty) &&
        Number.isFinite(item.xp) &&
        item.xp >= 0 &&
        typeof item.completed === 'boolean' &&
        (item.skillId === null || typeof item.skillId === 'string') &&
        typeof item.createdAt === 'string',
    ) ||
    !value.history.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        Number.isFinite(item.xp) &&
        item.xp >= 0 &&
        typeof item.timestamp === 'string' &&
        tiers.includes(item.difficulty) &&
        (item.skillId === null || typeof item.skillId === 'string') &&
        (item.status === undefined ||
          ['completed', 'missed'].includes(item.status)),
    ) ||
    !value.portfolio.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.description === 'string' &&
        typeof item.date === 'string' &&
        typeof item.category === 'string' &&
        (item.image === '' ||
          item.image === null ||
          typeof item.image === 'string'),
    ) ||
    !value.milestones.every(
      (item) =>
        item &&
        typeof item.key === 'string' &&
        typeof item.name === 'string' &&
        typeof item.description === 'string' &&
        typeof item.unlocked === 'boolean' &&
        (item.unlockedAt === null || typeof item.unlockedAt === 'string'),
    ) ||
    !rewards.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.description === 'string' &&
        [
          'quests_completed_total',
          'quests_completed_today',
          'streak_days',
          'skill_level',
          'xp_total',
        ].includes(item.conditionType) &&
        Number.isInteger(item.conditionValue) &&
        item.conditionValue > 0 &&
        typeof item.claimed === 'boolean' &&
        (item.unlockedAt === null || typeof item.unlockedAt === 'string'),
    ) ||
    !notifications.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.description === 'string' &&
        typeof item.timestamp === 'string' &&
        typeof item.read === 'boolean',
    ) ||
    !uniqueIds(value.skills) ||
    !uniqueIds(value.quests) ||
    !uniqueIds(value.history) ||
    !uniqueIds(value.portfolio) ||
    value.milestones.length !== initial.milestones.length ||
    !initial.milestones.every((milestone) =>
      value.milestones.some((item) => item.key === milestone.key),
    )
  )
    fail();
  return {
    ...initial,
    ...value,
    rules: {
      ...initial.rules,
      ...value.rules,
      difficultyXp: { ...initial.rules.difficultyXp, ...difficultyXp },
    },
    skills: value.skills.map((skill) => ({
      ...skill,
      monthlyTarget: {
        quests: 20,
        xp: 500,
        ...skill.monthlyTarget,
        month: thisMonth(),
      },
    })),
    rewards,
    notifications: notifications.slice(0, 50),
    user: { ...initial.user, ...value.user, lifeStages },
  };
}
