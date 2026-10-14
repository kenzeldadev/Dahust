// XP/level math. Level n -> n+1 costs curveBase * n^exponent. Teaches: pure functions.
export const xpNeededForLevel = (n, r) =>
  Math.floor(r.curveBase * Math.pow(n, r.curveExponent));
// Walk up from level 1, spending XP; returns {level, into}
function walk(total, r) {
  let level = 1,
    left = total;
  while (level < r.maxLevel && left >= xpNeededForLevel(level, r)) {
    left -= xpNeededForLevel(level, r);
    level++;
  }
  return { level, into: level >= r.maxLevel ? 0 : left };
}
export const levelFromXp = (t, r) => walk(t, r).level;
export const xpIntoCurrentLevel = (t, r) => walk(t, r).into;
export const xpToNextLevel = (t, r) => {
  const { level, into } = walk(t, r);
  return level >= r.maxLevel ? 0 : xpNeededForLevel(level, r) - into;
};
export const progressPercent = (t, r) => {
  const { level, into } = walk(t, r);
  return level >= r.maxLevel
    ? 100
    : Math.min(100, (into / xpNeededForLevel(level, r)) * 100);
};
