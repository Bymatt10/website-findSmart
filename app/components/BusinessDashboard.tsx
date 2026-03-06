import { useEffect } from 'react';
import { Link } from 'react-router';
import { TrendingUp, PackageOpen, Plus } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useBusinessStore } from '../stores/business.store';

export function BusinessDashboard({ onAddProduct }: { onAddProduct: () => void }) {
    const { transactions, stats, isLoading, fetchAll, fetchStats } = useBusinessStore();

    useEffect(() => {
        fetchAll();
        fetchStats();
    }, []);

    const chartData = Object.entries(stats.profitByMonth).map(([month, profit]) => ({
        month: month.split('-')[1],
        profit,
    }));

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <div className="px-5 pt-6 pb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-white text-3xl font-extrabold tracking-tight">Mi Negocio</h1>
                        <p className="text-emerald-400/80 text-xs mt-1">Ingresos, Inversión y Control</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-emerald-900/30 border border-emerald-900/50 p-4 rounded-3xl">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/20 mb-3">
                            <TrendingUp size={14} className="text-emerald-400" />
                        </div>
                        <p className="text-zinc-400 text-[10px] uppercase font-bold mb-1">Ganancia Neta</p>
                        <p className="text-white text-lg font-black tracking-tighter">
                            C${stats.netProfit.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-indigo-900/30 border border-indigo-900/50 p-4 rounded-3xl">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500/20 mb-3">
                            <PackageOpen size={14} className="text-indigo-400" />
                        </div>
                        <p className="text-zinc-400 text-[10px] uppercase font-bold mb-1">Inventario Actual</p>
                        <p className="text-white text-lg font-black tracking-tighter">
                            C${stats.inventoryValue.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Bar Chart */}
                {chartData.length > 0 && (
                    <div className="mb-6">
                        <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mb-3">Ganancia por Mes</p>
                        <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800/50 p-4">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis dataKey="month" stroke="#71717a" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickFormatter={(v) => `C$${v}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                                        labelStyle={{ color: '#a1a1aa' }}
                                        formatter={(v: any) => [`C$${Number(v).toFixed(0)}`, 'Ganancia']}
                                    />
                                    <Bar dataKey="profit" fill="#34d399" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Recent Transactions */}
                <div className="flex justify-between items-center mb-3 mt-4">
                    <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Últimos Registros</p>
                    <Link to="/transactions" className="text-indigo-400 font-medium text-[10px] uppercase hover:text-indigo-300">
                        Ver Todos
                    </Link>
                </div>

                {transactions.length === 0 ? (
                    <div className="flex items-center justify-center py-10">
                        <p className="text-zinc-500">No hay registros de compras ni ventas.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.slice(0, 3).map((t) => {
                            const totalInvested = Number(t.buy_cost) + Number(t.extra_costs);
                            const currencyStr = t.currency === 'USD' ? '$' : 'C$';
                            return (
                                <div key={t.id} className="bg-zinc-900/80 p-4 rounded-3xl border border-zinc-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 mr-3 min-w-0">
                                            <p className="text-white font-bold text-base truncate">{t.product_name}</p>
                                            {t.extra_costs_detail && (
                                                <p className="text-zinc-500 text-xs mt-0.5 truncate">Ext: {t.extra_costs_detail}</p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex-shrink-0 ${t.status === 'sold' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                            {t.status === 'sold' ? 'Vendido' : 'En Inventario'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-zinc-400 font-medium text-xs">
                                            Inv: {currencyStr}{totalInvested.toFixed(0)}
                                        </span>
                                        {t.status === 'sold' && (
                                            <span className="text-emerald-400 font-bold text-xs">
                                                Ganancia: +{currencyStr}{Number(t.profit).toFixed(0)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FAB */}
            <button
                onClick={onAddProduct}
                className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50 border border-emerald-400/50 hover:bg-emerald-500 transition-colors z-50"
            >
                <Plus size={26} className="text-white" />
            </button>
        </div>
    );
}
