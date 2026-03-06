import { useState, useEffect } from 'react';
import { useGoalsStore } from '../stores/goals.store';
import { useWalletsStore } from '../stores/wallets.store';
import { GoalCard } from '../components/GoalCard';
import { Target, Plus, X } from 'lucide-react';

function AddProgressModal({ goalId, onClose, onSuccess }: { goalId: string; onClose: () => void; onSuccess: () => void }) {
    const { wallets, fetchWallets } = useWalletsStore();
    const { addProgress } = useGoalsStore();
    const [amount, setAmount] = useState('');
    const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchWallets();
    }, []);

    useEffect(() => {
        if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
    }, [wallets]);

    async function handleContribute(e: React.FormEvent) {
        e.preventDefault();
        if (!amount || isNaN(Number(amount))) return;
        setIsSubmitting(true);
        await addProgress(goalId, Number(amount));
        setIsSubmitting(false);
        onSuccess();
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 lg:items-center" onClick={onClose}>
            <div className="bg-zinc-900 rounded-t-3xl lg:rounded-3xl p-6 w-full max-w-md border-t border-zinc-800 lg:border" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-white text-xl font-bold">Aportar a Meta</h2>
                    <button onClick={onClose} className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                        <X size={18} className="text-zinc-400" />
                    </button>
                </div>

                <form onSubmit={handleContribute} className="space-y-5">
                    <div>
                        <label className="text-zinc-400 text-xs font-semibold block mb-2">Monto a agregar</label>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                autoFocus
                                required
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="bg-transparent text-white text-base w-full focus:outline-none placeholder-zinc-600"
                            />
                        </div>
                    </div>

                    {wallets.length > 0 && (
                        <div>
                            <label className="text-zinc-400 text-xs font-semibold block mb-2">Desde billetera (Opcional)</label>
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {wallets.map((w) => (
                                    <button
                                        key={w.id}
                                        type="button"
                                        onClick={() => setSelectedWalletId(w.id)}
                                        className={`px-4 py-2.5 rounded-xl border flex-shrink-0 transition-colors ${selectedWalletId === w.id ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400 font-bold' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}
                                    >
                                        {w.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors disabled:opacity-60 flex items-center justify-center"
                    >
                        {isSubmitting ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Hacer aporte'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function GoalsPage() {
    const { goals, isLoading, fetchGoals, createGoal } = useGoalsStore();
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalAmount, setNewGoalAmount] = useState('');
    const [newGoalCurrency, setNewGoalCurrency] = useState<'NIO' | 'USD'>('NIO');
    const [newGoalDeadline, setNewGoalDeadline] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchGoals(); }, []);

    const activeGoals = goals.filter((g) => g.status === 'active');
    const completedGoals = goals.filter((g) => g.status === 'completed');

    async function handleCreateGoal(e: React.FormEvent) {
        e.preventDefault();
        if (!newGoalTitle || !newGoalAmount) return;
        setSaving(true);
        await createGoal({
            title: newGoalTitle,
            target_amount: Number(newGoalAmount),
            target_currency: newGoalCurrency,
            deadline: newGoalDeadline || undefined,
        });
        setSaving(false);
        setShowAddGoal(false);
        setNewGoalTitle('');
        setNewGoalAmount('');
        setNewGoalDeadline('');
        fetchGoals(true);
    }

    return (
        <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-white text-3xl font-extrabold tracking-tight">Mis Metas</h1>
                    <p className="text-zinc-500 text-xs mt-1">Conquista tu futuro financiero</p>
                </div>
                <button
                    onClick={() => setShowAddGoal(true)}
                    className="w-11 h-11 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
                >
                    <Plus size={20} className="text-indigo-400" />
                </button>
            </div>

            {isLoading && goals.length === 0 && (
                <div className="flex justify-center py-16">
                    <span className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {goals.length === 0 && !isLoading && (
                <div className="flex flex-col items-center py-16">
                    <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-4">
                        <Target size={36} className="text-indigo-400" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">No tienes metas aún</h3>
                    <p className="text-zinc-500 text-sm text-center mb-6 max-w-xs">
                        Crea tu primera meta de ahorro y visualiza tu progreso día a día.
                    </p>
                    <button
                        onClick={() => setShowAddGoal(true)}
                        className="bg-indigo-600 px-8 py-3.5 rounded-2xl text-white font-bold text-sm hover:bg-indigo-500 transition-colors"
                    >
                        Crear Meta
                    </button>
                </div>
            )}

            {activeGoals.length > 0 && (
                <div className="mb-6">
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mb-3">Activas</p>
                    {activeGoals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} onAdd={(id) => setSelectedGoalId(id)} />
                    ))}
                </div>
            )}

            {completedGoals.length > 0 && (
                <div className="mb-6">
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mb-3">Completadas</p>
                    {completedGoals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} onAdd={() => { }} />
                    ))}
                </div>
            )}

            {/* Progress Modal */}
            {selectedGoalId && (
                <AddProgressModal
                    goalId={selectedGoalId}
                    onClose={() => setSelectedGoalId(null)}
                    onSuccess={() => fetchGoals(true)}
                />
            )}

            {/* Add Goal Modal */}
            {showAddGoal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 lg:items-center" onClick={() => setShowAddGoal(false)}>
                    <div className="bg-zinc-900 rounded-t-3xl lg:rounded-3xl p-6 w-full max-w-md border-t border-zinc-800 lg:border" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-white text-xl font-bold">Nueva Meta</h2>
                            <button onClick={() => setShowAddGoal(false)} className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                                <X size={18} className="text-zinc-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateGoal} className="space-y-4">
                            <div>
                                <label className="text-zinc-400 text-xs font-semibold block mb-2">Nombre de la Meta</label>
                                <input
                                    required
                                    autoFocus
                                    placeholder="Ej. Fondo de emergencia"
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                    className="w-full h-12 bg-zinc-950 rounded-xl px-4 text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder-zinc-600"
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-zinc-400 text-xs font-semibold block mb-2">Monto Objetivo</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="1"
                                        required
                                        placeholder="0.00"
                                        value={newGoalAmount}
                                        onChange={(e) => setNewGoalAmount(e.target.value)}
                                        className="w-full h-12 bg-zinc-950 rounded-xl px-4 text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder-zinc-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-zinc-400 text-xs font-semibold block mb-2">Moneda</label>
                                    <div className="flex border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden h-12">
                                        {(['NIO', 'USD'] as const).map((cur) => (
                                            <button
                                                key={cur}
                                                type="button"
                                                onClick={() => setNewGoalCurrency(cur)}
                                                className={`flex-1 px-3 font-bold text-sm transition-colors ${newGoalCurrency === cur ? 'bg-indigo-600/20 text-indigo-400' : 'text-zinc-500'}`}
                                            >
                                                {cur === 'NIO' ? 'C$' : '$'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-zinc-400 text-xs font-semibold block mb-2">Fecha Límite (Opcional)</label>
                                <input
                                    type="date"
                                    value={newGoalDeadline}
                                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                                    className="w-full h-12 bg-zinc-950 rounded-xl px-4 text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors disabled:opacity-60 flex items-center justify-center"
                            >
                                {saving ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Crear Meta'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
