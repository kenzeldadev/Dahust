// Shorthand for the context. Teaches: custom hooks.
import { useContext } from 'react';
import { GameContext } from '../context/GameContext.jsx';
export default function useGame() { return useContext(GameContext) }
