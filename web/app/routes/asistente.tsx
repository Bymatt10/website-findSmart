import { useEffect } from 'react';
import { Link } from 'react-router';
import { useInsightsStore } from '../stores/insights.store';
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp, TrendingDown, Target, MessageCircle, RefreshCw } from 'lucide-react';

export default function AsistentePage() {
    const { dashboard, isLoading, fetchInsightsDashboard } = useInsightsStore();

    useEffect(() => { fetchInsightsDashboard(); }, []);

    const formatCurrency = (amount: number, currency: string) => {
        return `${currency === 'USD' ? '$' : 'C$'}${Math.abs(amount).toFixed(2)}`;
    };

    return (
        <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-white text-3xl font-extrabold tracking-tight">Asistente</h1>
                <button
                    onClick={() => fetchInsightsDashboard(true)}
                    className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 hover:bg-zinc-800 transition-colors"
                    disabled={isLoading}
                >
                    <RefreshCw size={16} className={`text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {isLoading && !dashboard && (
                <div className="flex justify-center py-16">
                    <span className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Daily Insight */}
            {dashboard?.dailyInsight && (
                <div className="bg-indigo-900/30 rounded-3xl p-5 mb-6 border border-indigo-500/30">
                    <div className="flex items-center mb-3">
                        <div className="w-9 h-9 bg-indigo-500/20 rounded-xl flex items-center justify-center mr-3">
                            <Sparkles size={18} className="text-indigo-400" />
                        </div>
                        <span className="text-indigo-300 font-bold text-xs uppercase tracking-widest">Resumen de hoy</span>
                    </div>
                    <p className="text-white text-[15px] leading-relaxed">{dashboard.dailyInsight.text}</p>
                </div>
            )}

            {/* Alerts */}
            {dashboard?.alerts && dashboard.alerts.length > 0 && (
                <div className="mb-6">
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mb-3">Alertas</p>
                    {dashboard.alerts.map((alert, idx) => (
                        <div key={idx} className="bg-red-950/30 rounded-2xl p-4 mb-3 border border-red-900/30 flex items-center">
                            <div className="w-9 h-9 bg-red-500/15 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                                <AlertTriangle size={18} className="text-red-400" />
                            </div>
                            <p className="text-red-200 text-sm">{alert.text}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Recommended Action */}
            {dashboard?.recommendedAction && (
                <div className="mb-6">
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mb-3">Tu Próximo Paso</p>
                    <div className="bg-emerald-950/30 rounded-2xl p-4 border border-emerald-900/30 flex items-center">
                        <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center mr-3 flex-shrink-0">
                            <Lightbulb size={18} className="text-emerald-400" />
                        </div>
                        <p className="text-emerald-200 text-sm font-medium">{dashboard.recommendedAction.text}</p>
                    </div>
                </div>
            )}

            {/* Trends */}
            {dashboard?.trends && dashboard.trends.length > 0 && (
                <div className="mb-6">
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mb-3">Tendencias</p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {dashboard.trends.map((trend, idx) => {
                            const isUp = (trend.text || '').includes('↑') || (trend.text || '').includes('subió');
                            return (
                                <div key={idx} className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 w-60 flex-shrink-0">
                                    <div className="flex items-center mb-2">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isUp ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                                            {isUp ? <TrendingUp size={14} className="text-red-400" /> : <TrendingDown size={14} className="text-emerald-400" />}
                                        </div>
                                    </div>
                                    <p className="text-white text-sm">{trend.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Goals */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-3">
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Tus Metas</p>
                    <Link to="/goals" className="text-indigo-400 text-xs font-medium hover:text-indigo-300 transition-colors">+ Nueva</Link>
                </div>
                {(!dashboard?.goals || dashboard.goals.length === 0) ? (
                    <p className="text-zinc-600 text-sm italic">No tienes metas activas.</p>
                ) : (
                    dashboard.goals.map((goal: any) => {
                        const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                        return (
                            <div key={goal.id} className="bg-zinc-900/80 rounded-2xl p-4 mb-3 border border-zinc-800">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center flex-1 mr-2">
                                        <div className="w-8 h-8 bg-indigo-500/15 rounded-lg flex items-center justify-center mr-2.5">
                                            <Target size={14} className="text-indigo-400" />
                                        </div>
                                        <p className="text-white font-semibold text-sm truncate">{goal.title}</p>
                                    </div>
                                    <p className="text-zinc-500 text-xs flex-shrink-0">
                                        {formatCurrency(goal.target_amount, goal.target_currency || 'NIO')}
                                    </p>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-1">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${progress}%` }} />
                                </div>
                                <p className="text-zinc-600 text-[10px] text-right">{progress.toFixed(0)}%</p>
                            </div>
                        );
                    })
                )}
            </div>

            {/* FAB Chat */}
            <Link
                to="/chat"
                className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50 border border-emerald-400/50 hover:bg-emerald-500 transition-colors z-50"
            >
                <MessageCircle size={24} className="text-white" />
            </Link>
        </div>
    );
}
