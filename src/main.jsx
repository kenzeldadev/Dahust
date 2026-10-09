// Entry point. Teaches: mounting React + providers.
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GameProvider } from './context/GameContext.jsx';
import App from './App.jsx';
import './index.css';
createRoot(document.getElementById('root')).render(<BrowserRouter><GameProvider><App /></GameProvider></BrowserRouter>);
