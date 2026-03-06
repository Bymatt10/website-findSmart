import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../services/supabase';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function signIn(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else navigate('/');
        setLoading(false);
    }

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">FinSmart</h1>
                <p className="text-zinc-400 text-lg">Inteligencia financiera en tu bolsillo</p>
            </div>

            <form onSubmit={signIn} className="space-y-4">
                <input
                    type="email"
                    required
                    className="w-full h-14 bg-zinc-900 rounded-xl px-4 text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder-zinc-600 transition-colors"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoCapitalize="none"
                />
                <input
                    type="password"
                    required
                    className="w-full h-14 bg-zinc-900 rounded-xl px-4 text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder-zinc-600 transition-colors"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <p className="text-red-400 text-sm bg-red-900/20 border border-red-900/30 rounded-xl px-4 py-3">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-indigo-600 rounded-xl text-white font-bold text-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center mt-4"
                >
                    {loading ? (
                        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : 'Iniciar Sesión'}
                </button>
            </form>

            <Link to="/register" className="block text-center text-zinc-400 mt-6 hover:text-zinc-200 transition-colors">
                ¿No tienes cuenta? <span className="text-indigo-400 font-semibold">Regístrate</span>
            </Link>
        </div>
    );
}
