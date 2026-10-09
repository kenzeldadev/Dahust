// Navbar + page outlet. Teaches: <Outlet/>.
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import s from './Layout.module.css';
export default function Layout() { return <><Navbar /><main className={s.main}><Outlet /></main></> }
