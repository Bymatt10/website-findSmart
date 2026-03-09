import { useState, useEffect } from 'react';
import { TransactionCard } from '../components/TransactionCard';
import { useBusinessStore } from '../stores/business.store';
import { apiClient } from '../services/api';
import { List, RefreshCw, Building2, FileText } from 'lucide-react';
import { Link } from 'react-router';

export default function TransactionsPage() {
    const { isBusinessModeActive, transactions: bizTx, fetchAll } = useBusinessStore();
    const [personalTx, setPersonalTx] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // YYYY-MM formatted string for the personal select dropdown
    const [currentMonthSelection, setCurrentMonthSelection] = useState<string>(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    async function fetchPersonal() {
        setIsLoading(true);
        try {
            const [yearStr, monthStr] = currentMonthSelection.split('-');
            const params: any = { limit: 500, year: parseInt(yearStr), month: parseInt(monthStr) };
            
            const res = await apiClient.get('/transactions', { params });
            const raw = res.data?.data || [];
            setPersonalTx(raw.map((t: any) => ({
                id: t.id,
                name: t.merchant_name || t.description || 'Gasto',
                category: t.categories?.name || 'Sin Categoría',
                amount: Number(t.amount),
                date: new Date(t.date).toLocaleDateString(),
                icon: t.categories?.icon || 'MapPin',
                original_currency: t.original_currency,
            })));
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (isBusinessModeActive) fetchAll();
        else fetchPersonal();
    }, [isBusinessModeActive, currentMonthSelection]);

    // Generate last 12 months for selector
    const monthOptions = Array.from({ length: 12 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d);
        return { value: `${y}-${m}`, label: label.charAt(0).toUpperCase() + label.slice(1) };
    });

    return (
        <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-white text-3xl font-extrabold tracking-tight">Transacciones</h1>
                    <p className="text-zinc-500 text-xs mt-1">
                        {isBusinessModeActive ? 'Registros de tu negocio' : 'Historial personal completo'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {!isBusinessModeActive && (
                        <Link
                            to="/estado-cuenta"
                            className="h-10 px-4 bg-indigo-600/20 text-indigo-400 font-bold rounded-xl flex items-center gap-2 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
                        >
                            <FileText size={16} />
                            <span className="hidden sm:inline">Subir Estado de Cuenta</span>
                        </Link>
                    )}
                    <button
                        onClick={() => isBusinessModeActive ? fetchAll() : fetchPersonal()}
                        disabled={isLoading}
                        className="hidden sm:flex w-10 h-10 bg-zinc-900 rounded-xl items-center justify-center border border-zinc-800 hover:bg-zinc-800 transition-colors"
                    >
                        <RefreshCw size={16} className={`text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {!isBusinessModeActive && (
                <div className="mb-6 flex">
                    <select
                        value={currentMonthSelection}
                        onChange={(e) => setCurrentMonthSelection(e.target.value)}
                        className="bg-zinc-900 text-white text-sm border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 appearance-none font-medium custom-select shadow-sm"
                    >
                        {monthOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {!isBusinessModeActive && !isLoading && personalTx.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-emerald-900/30 border border-emerald-900/50 p-4 rounded-3xl">
                        <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-1">Total Ingresos</p>
                        <p className="text-white text-xl font-black">
                            C${personalTx.reduce((acc, t) => t.amount > 0 ? acc + t.amount : acc, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="bg-red-900/30 border border-red-900/50 p-4 rounded-3xl">
                        <p className="text-red-400 font-bold text-[10px] uppercase tracking-widest mb-1">Total Gastos</p>
                        <p className="text-white text-xl font-black">
                            C${personalTx.reduce((acc, t) => t.amount < 0 ? acc + Math.abs(t.amount) : acc, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex justify-center py-16">
                    <span className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Personal transactions */}
            {!isBusinessModeActive && !isLoading && (
                <div className="bg-zinc-900/50 rounded-2xl px-4 border border-zinc-800/50">
                    {personalTx.length === 0 ? (
                        <div className="flex flex-col items-center py-16 gap-4">
                            <List size={36} className="text-zinc-600" />
                            <p className="text-zinc-500 text-sm">No hay transacciones registradas.</p>
                        </div>
                    ) : (
                        personalTx.map((t) => <TransactionCard key={t.id} transaction={t} />)
                    )}
                </div>
            )}

            {/* Business transactions */}
            {isBusinessModeActive && !isLoading && (
                <div className="space-y-3">
                    {bizTx.length === 0 ? (
                        <div className="flex flex-col items-center py-16 gap-4">
                            <Building2 size={36} className="text-zinc-600" />
                            <p className="text-zinc-500 text-sm">No hay registros de compras o ventas.</p>
                        </div>
                    ) : (
                        bizTx.map((t) => {
                            const total = Number(t.buy_cost) + Number(t.extra_costs);
                            const sym = t.currency === 'USD' ? '$' : 'C$';
                            return (
                                <div key={t.id} className="bg-zinc-900/80 p-4 rounded-3xl border border-zinc-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0 mr-3">
                                            <p className="text-white font-bold truncate">{t.product_name}</p>
                                            {t.extra_costs_detail && <p className="text-zinc-500 text-xs truncate">Ext: {t.extra_costs_detail}</p>}
                                        </div>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex-shrink-0 ${t.status === 'sold' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                            {t.status === 'sold' ? 'Vendido' : 'En Inventario'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <span className="text-zinc-400 text-xs">Inv: {sym}{total.toLocaleString('en-US', { disableFractionDigitsFallback: true } as any)}</span>
                                        {t.status === 'sold' && <span className="text-emerald-400 font-bold text-xs">Ganancia: +{sym}{Number(t.profit).toLocaleString('en-US')}</span>}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
