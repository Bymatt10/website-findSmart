import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/auth.store';

export default function AuthLayout() {
    const { session, setSession, setInitialized, initialized } = useAuthStore();
    const navigate = useNavigate();

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
        if (initialized && session) {
            navigate('/');
        }
    }, [session, initialized]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <Outlet />
            </div>
        </div>
    );
}
