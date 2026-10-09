// Provider: reducer + persistence + toasts for unlocks/level-ups. Teaches: Context.
import { createContext, useReducer, useEffect, useRef, useState, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { gameReducer, makeInitialState } from './gameReducer.js';
import { levelFromXp } from '../utils/xp.js';
import Toast from '../components/Toast.jsx';
import LevelUpOverlay from '../components/LevelUpOverlay.jsx';
export const GameContext = createContext(null);

const currentMonth = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
};
function migrateState(saved) {
    const initial = makeInitialState();
    if (!saved || typeof saved !== 'object') return initial;
    return {
        ...initial,
        ...saved,
        user: { ...initial.user, ...(saved.user || {}), lifeStages: Array.isArray(saved.user?.lifeStages) ? saved.user.lifeStages : [] },
        rules: { ...initial.rules, ...(saved.rules || {}), difficultyXp: { ...initial.rules.difficultyXp, ...(saved.rules?.difficultyXp || {}) } },
        skills: (Array.isArray(saved.skills) ? saved.skills : []).map(skill => ({
            ...skill,
            monthlyTarget: { quests: 20, xp: 500, ...(skill.monthlyTarget || {}), month: currentMonth() }
        })),
        quests: Array.isArray(saved.quests) ? saved.quests : [],
        history: Array.isArray(saved.history) ? saved.history : [],
        portfolio: Array.isArray(saved.portfolio) ? saved.portfolio : [],
        milestones: Array.isArray(saved.milestones) ? saved.milestones : initial.milestones,
        rewards: Array.isArray(saved.rewards) ? saved.rewards.map(reward => ({ unlockedAt: null, claimed: false, ...reward })) : [],
        notifications: Array.isArray(saved.notifications) ? saved.notifications.slice(0, 50) : []
    };
}

export function GameProvider({ children }) {
    const [saved, setSaved] = useLocalStorage('dahust-state', null, migrateState);
    // Migrate nested state fields while preserving all previously saved data.
    const [state, reducerDispatch] = useReducer(gameReducer, saved, migrateState);
    const dispatch = reducerDispatch;
    useEffect(() => setSaved(state), [state, setSaved]);
    const [toasts, setToasts] = useState([]);
    const [levelUp, setLevelUp] = useState(null);
    const toast = useCallback(msg => { const id = Date.now() + Math.random(); setToasts(t => [...t, { id, msg }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000) }, []);
    const prev = useRef(state);
    useEffect(() => { // diff against previous state to detect unlocks / level-ups
        const p = prev.current;
        state.milestones.forEach((m, i) => { if (m.unlocked && !p.milestones[i]?.unlocked) toast(`🏆 Milestone: ${m.name}`) });
        const a = levelFromXp(p.user.totalXp, p.rules), b = levelFromXp(state.user.totalXp, state.rules);
        if (b > a) {
            toast(`⬆ LEVEL UP! LV ${b}`);
            setLevelUp(b);
            reducerDispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'level', title: `Level ${b} reached`, description: `You earned enough XP to reach level ${b}.`, icon: 'TrendingUp' } });
        }
        prev.current = state
    }, [state, toast]);
    useEffect(() => {
        if (levelUp == null) return undefined;
        const timer = setTimeout(() => setLevelUp(null), 1500);
        return () => clearTimeout(timer)
    }, [levelUp]);
    return <GameContext.Provider value={{ state, dispatch, toast }}>{children}<Toast toasts={toasts} /><LevelUpOverlay level={levelUp} /></GameContext.Provider>
}
