import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { TrendingUp, TrendingDown, Plus, LayoutGrid, Target, MessageCircle } from 'lucide-react';
import { TransactionCard } from './TransactionCard';
import { useAuthStore } from '../stores/auth.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useGoalsStore } from '../stores/goals.store';
import { useCurrencyStore } from '../stores/currency.store';

export function PersonalDashboard({ onAddTransaction }: { onAddTransaction: () => void }) {
    const { user } = useAuthStore();
    const { transactions, totalBalance, totalExpenses, totalIncome, isLoading, fetchDashboardData } = useDashboardStore();
    const { goals, fetchGoals } = useGoalsStore();
    const { currentRate, fetchRate } = useCurrencyStore();
    const [currencyDisplay, setCurrencyDisplay] = useState<'NIO' | 'USD'>('NIO');

    useEffect(() => {
        fetchDashboardData();
        fetchGoals();
        if (!currentRate) fetchRate();
    }, []);

    const activeGoals = goals.filter((g) => g.status === 'active');

    const formatAmount = (amount: number) => {
        if (currencyDisplay === 'USD' && currentRate) return (amount / currentRate).toFixed(2);
        return amount.toFixed(2);
    };

    const name = user?.user_metadata?.name || 'Usuario';

    return (
        <div className="flex flex-col h-full">
            {/* Hero */}
            <div
                className="px-6 pb-7 pt-8 rounded-b-3xl"
                style={{ background: 'linear-gradient(135deg, #4338ca, #7c3aed, #6d28d9)' }}
            >
                <div className="flex justify-between items-center mb-1">
                    <div>
                        <p className="text-indigo-200/80 text-xs font-medium">Hola,</p>
                        <p className="text-white text-xl font-bold">{name}</p>
                    </div>
                    <button
                        className="bg-white/15 px-3.5 py-1.5 rounded-full text-white text-xs font-bold hover:bg-white/20 transition-colors"
                        onClick={() => setCurrencyDisplay(currencyDisplay === 'NIO' ? 'USD' : 'NIO')}
                    >
                        {currencyDisplay}
                    </button>
                </div>

                <div className="mt-3 mb-5">
                    <p className="text-indigo-200/60 text-xs mb-0.5">Balance</p>
                    <p className="text-white text-4xl font-black tracking-tight">
                        {currencyDisplay === 'USD' ? '$' : 'C$'}{formatAmount(Math.abs(totalBalance))}
                    </p>
                </div>

                <div className="flex justify-between">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center mr-2">
                            <TrendingUp size={14} className="text-emerald-300" />
                        </div>
                        <div>
                            <p className="text-indigo-200/60 text-[10px]">Ingresos</p>
                            <p className="text-emerald-300 font-bold text-sm">
                                +{currencyDisplay === 'USD' ? '$' : 'C$'}{formatAmount(totalIncome)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center mr-2">
                            <TrendingDown size={14} className="text-red-300" />
                        </div>
                        <div>
                            <p className="text-indigo-200/60 text-[10px]">Gastos</p>
                            <p className="text-red-300 font-bold text-sm">
                                {currencyDisplay === 'USD' ? '$' : 'C$'}{formatAmount(Math.abs(totalExpenses))}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Quick Actions */}
                <div className="flex justify-between mx-5 mt-6 mb-6">
                    {[
                        { label: 'Registrar', Icon: Plus, to: '#', onClick: onAddTransaction },
                        { label: 'Categorías', Icon: LayoutGrid, to: '/perfil' },
                        { label: 'Metas', Icon: Target, to: '/goals' },
                        { label: 'Chat IA', Icon: MessageCircle, to: '/chat' },
                    ].map((action, idx) => (
                        action.onClick ? (
                            <button key={idx} onClick={action.onClick} className="flex flex-col items-center group">
                                <div className="w-14 h-14 bg-indigo-600/15 border border-indigo-500/25 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-indigo-600/25 transition-colors">
                                    <action.Icon size={22} className="text-indigo-400" />
                                </div>
                                <span className="text-zinc-400 text-[10px] font-medium">{action.label}</span>
                            </button>
                        ) : (
                            <Link key={idx} to={action.to!} className="flex flex-col items-center group">
                                <div className="w-14 h-14 bg-indigo-600/15 border border-indigo-500/25 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-indigo-600/25 transition-colors">
                                    <action.Icon size={22} className="text-indigo-400" />
                                </div>
                                <span className="text-zinc-400 text-[10px] font-medium">{action.label}</span>
                            </Link>
                        )
                    ))}
                </div>

                {/* Active Goals */}
                {activeGoals.length > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between items-center mx-5 mb-3">
                            <p className="text-white font-bold text-base">Mis Metas</p>
                            <Link to="/goals" className="text-indigo-400 text-xs font-medium hover:text-indigo-300">
                                Ver Todas
                            </Link>
                        </div>
                        <div className="flex gap-3 px-5 overflow-x-auto pb-2">
                            {activeGoals.slice(0, 4).map((goal) => {
                                const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                                const currSymbol = goal.target_currency === 'USD' ? '$' : 'C$';
                                return (
                                    <div key={goal.id} className="w-40 flex-shrink-0 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
                                        <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center mb-3">
                                            <Target size={18} className="text-indigo-400" />
                                        </div>
                                        <p className="text-white text-sm font-semibold mb-0.5 truncate">{goal.title}</p>
                                        <p className="text-zinc-500 text-[10px] mb-3">
                                            Meta: {currSymbol}{Number(goal.target_amount).toLocaleString()}
                                        </p>
                                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                                        </div>
                                        <p className="text-zinc-600 text-[10px] text-right">{progress.toFixed(0)}%</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Transactions */}
                <div className="mx-5 mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-white font-bold text-base">Últimos Movimientos</p>
                        <Link to="/transactions" className="text-indigo-400 text-xs font-medium hover:text-indigo-300">
                            Ver todos
                        </Link>
                    </div>
                    <div className="bg-zinc-900/50 rounded-2xl px-4 border border-zinc-800/50">
                        {transactions.length === 0 && !isLoading ? (
                            <p className="text-zinc-500 text-center py-8">No hay movimientos recientes.</p>
                        ) : (
                            transactions.map((t) => (
                                <TransactionCard key={t.id} transaction={t} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* FAB */}
            <button
                onClick={onAddTransaction}
                className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/50 border border-indigo-400/50 hover:bg-indigo-500 transition-colors z-50"
            >
                <Plus size={26} className="text-white" />
            </button>
        </div>
    );
}
