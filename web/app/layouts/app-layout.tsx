import { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/auth.store';
import { useBusinessStore } from '../stores/business.store';
import { ThemeToggle } from '../components/ThemeToggle';
import {
    LayoutDashboard, List, Target, Sparkles, MessageCircle, User, Briefcase, Menu, X, LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
    { to: '/', label: 'Dashboard', Icon: LayoutDashboard, end: true },
    { to: '/transactions', label: 'Transacciones', Icon: List },
    { to: '/goals', label: 'Mis Metas', Icon: Target },
    { to: '/asistente', label: 'Asistente', Icon: Sparkles },
    { to: '/chat', label: 'Chat IA', Icon: MessageCircle },
    { to: '/perfil', label: 'Perfil', Icon: User },
];

export default function AppLayout() {
    const { session, setSession, setInitialized, initialized } = useAuthStore();
    const { isBusinessModeActive, setBusinessModeActive } = useBusinessStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setInitialized(true);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (initialized && !session) {
            navigate('/login');
        }
    }, [session, initialized]);

    if (!initialized) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
        <aside className={`${mobile ? 'flex' : 'hidden lg:flex'} flex-col w-64 bg-white dark:bg-zinc-900/60 border-r border-zinc-200 dark:border-zinc-800/50 min-h-screen py-6 px-4`}>
            {/* Logo */}
            <div className="mb-8 px-2">
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">FinSmart</h1>
                <p className="text-zinc-500 text-xs mt-0.5">Inteligencia financiera</p>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map(({ to, label, Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white'
                            }`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Theme Toggle */}
            <div className="mt-8 mb-4 px-2">
                <ThemeToggle />
            </div>

            {/* Business Mode Toggle */}
            <div className="mt-2 bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl px-4 py-4 border border-zinc-200 dark:border-zinc-800/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/20">
                            <Briefcase size={16} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-zinc-900 dark:text-white text-sm font-medium">Emprendedor</p>
                            <p className="text-zinc-500 dark:text-zinc-400 text-[10px]">Modo negocio</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setBusinessModeActive(!isBusinessModeActive)}
                        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 ${isBusinessModeActive ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                    >
                        <span
                            className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${isBusinessModeActive ? 'translate-x-5' : 'translate-x-0'}`}
                        />
                    </button>
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={() => supabase.auth.signOut()}
                className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full"
            >
                <LogOut size={18} />
                Cerrar Sesión
            </button>
        </aside>
    );

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="absolute left-0 top-0 bottom-0 z-50">
                        <Sidebar mobile />
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Mobile topbar */}
                <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800/50">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} className="text-zinc-900 dark:text-white" />
                    </button>
                    <h1 className="text-zinc-900 dark:text-white font-bold text-lg">FinSmart</h1>
                    <div className="w-6" />
                </div>

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
