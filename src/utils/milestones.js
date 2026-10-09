// Computes display progress without changing milestone unlock rules. Teaches: derived state.
import { levelFromXp } from './xp.js';

export function milestoneProgress(milestone, state) {
    const data = {
        first_blood: [state.history.length, 1],
        streak7: [state.user.bestStreak, 7],
        streak30: [state.user.bestStreak, 30],
        xp1000: [state.user.totalXp, 1000],
        lv10: [levelFromXp(state.user.totalXp, state.rules), 10],
        lv25: [levelFromXp(state.user.totalXp, state.rules), 25],
        lv50: [levelFromXp(state.user.totalXp, state.rules), 50],
        q100: [state.history.length, 100],
        q500: [state.history.length, 500],
        legend: [state.history.some(entry => entry.difficulty === 'Legendary') ? 1 : 0, 1],
        skills5: [state.skills.length, 5],
        port10: [state.portfolio.length, 10]
    }[milestone.key] || [0, 1];
    return { current: data[0], target: data[1], percent: Math.min(100, Math.floor(data[0] / data[1] * 100)) };
}
