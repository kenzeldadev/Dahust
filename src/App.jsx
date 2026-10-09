// App routes inside the shared dashboard layout. Teaches: nested React Router routes.
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Profile from './pages/Profile.jsx';
import History from './pages/History.jsx';
import Skills from './pages/Skills.jsx';
import SkillDetail from './pages/SkillDetail.jsx';
import Achievements from './pages/Achievements.jsx';
import Stats from './pages/Stats.jsx';

export default function App() {
    return <Routes><Route element={<Layout />}>
        <Route index element={<Profile />} />
        <Route path="history" element={<History />} />
        <Route path="skills" element={<Skills />} />
        <Route path="skills/:id" element={<SkillDetail />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="stats" element={<Stats />} />
    </Route></Routes>
}
