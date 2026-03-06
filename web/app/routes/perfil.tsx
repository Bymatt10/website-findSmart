import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/auth.store';
import { useBusinessStore } from '../stores/business.store';
import { useWalletsStore } from '../stores/wallets.store';
import { useCategoriesStore } from '../stores/categories.store';
import { Wallet, LayoutGrid, Target, MessageCircle, LogOut, ChevronRight, Briefcase, Plus, X, CreditCard, Landmark, Banknote, PiggyBank, Pencil, Trash2 } from 'lucide-react';

const BANKS_LIST = ['BAC', 'Lafise', 'Banpro', 'Ficohsa', 'Avanz', 'BDF', 'Efectivo', 'Otro'];
const BANK_COLORS: Record<string, string> = { BAC: '#dc2626', Lafise: '#16a34a', Banpro: '#059669', Ficohsa: '#2563eb', Avanz: '#ea580c', BDF: '#0284c7', Efectivo: '#818cf8', Otro: '#71717a' };

export default function PerfilPage() {
    const { user } = useAuthStore();
    const { isBusinessModeActive, setBusinessModeActive } = useBusinessStore();
    const { wallets, fetchWallets, createWallet, updateWallet, deleteWallet } = useWalletsStore();
    const { categories, fetchCategories, createCategory, deleteCategory } = useCategoriesStore();
    const navigate = useNavigate();
    const [showWallets, setShowWallets] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [isAddingWallet, setIsAddingWallet] = useState(false);
    const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
    const [bankName, setBankName] = useState('BAC');
    const [walletName, setWalletName] = useState('');
    const [walletType, setWalletType] = useState<'debit' | 'savings' | 'credit_card' | 'cash'>('debit');
    const [walletCurrency, setWalletCurrency] = useState<'NIO' | 'USD'>('NIO');
    const [walletBalance, setWalletBalance] = useState('');
    const [newCatName, setNewCatName] = useState('');

    useEffect(() => { fetchWallets(); fetchCategories(); }, []);

    const name = user?.user_metadata?.name || 'Usuario';
    const email = user?.email || '';
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const resetWalletForm = () => {
        setBankName('BAC'); setWalletName(''); setWalletType('debit');
        setWalletCurrency('NIO'); setWalletBalance('');
        setIsAddingWallet(false); setEditingWalletId(null);
    };

    async function handleSaveWallet(e: React.FormEvent) {
        e.preventDefault();
        if (!walletName.trim()) return;
        const data = { bank_name: walletType === 'cash' ? 'Efectivo' : bankName, name: walletName, type: walletType, currency: walletCurrency, balance: Number(walletBalance) || 0, icon: walletType === 'cash' ? 'Banknote' : walletType === 'credit_card' ? 'CreditCard' : 'Landmark' };
        if (editingWalletId) await updateWallet(editingWalletId, data);
        else await createWallet(data as any);
        resetWalletForm(); fetchWallets();
    }

    async function handleAddCategory(e: React.FormEvent) {
        e.preventDefault();
        if (!newCatName.trim()) return;
        await createCategory(newCatName, 'ShoppingBag');
        setNewCatName('');
    }

    const grouped = wallets.reduce((acc, w) => {
        const bn = w.bank_name || 'Otro';
        if (!acc[bn]) acc[bn] = [];
        acc[bn].push(w); return acc;
    }, {} as Record<string, typeof wallets>);

    const MenuRow = ({ icon: Icon, label, to, onClick, danger = false }: any) => {
        const cls = `flex items-center py-4 border-b ${danger ? 'border-red-900/20' : 'border-zinc-800/50'} w-full text-left hover:opacity-80 transition-opacity`;
        const body = (<><div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${danger ? 'bg-red-500/10' : 'bg-indigo-500/10'}`}><Icon size={18} className={danger ? 'text-red-400' : 'text-indigo-400'} /></div><span className={`flex-1 font-medium text-[15px] ${danger ? 'text-red-400' : 'text-white'}`}>{label}</span><ChevronRight size={18} className="text-zinc-700" /></>);
        return to ? <Link to={to} className={cls}>{body}</Link> : <button onClick={onClick} className={cls}>{body}</button>;
    };

    return (
        <div className="px-5 pt-6 pb-10 max-w-2xl mx-auto">
            <h1 className="text-white text-3xl font-extrabold tracking-tight mb-6">Perfil</h1>
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 bg-indigo-600/20 border-2 border-indigo-500/40 rounded-3xl flex items-center justify-center mb-3">
                    <span className="text-indigo-400 text-2xl font-black">{initials}</span>
                </div>
                <p className="text-white text-lg font-bold">{name}</p>
                {email && <p className="text-zinc-500 text-sm mt-0.5">{email}</p>}
            </div>

            <p className="text-zinc-400 font-bold text-xs uppercase mb-2 ml-2">Entorno</p>
            <div className="bg-zinc-900/50 rounded-2xl px-4 py-4 border border-zinc-800/50 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 bg-emerald-500/10"><Briefcase size={18} className="text-emerald-400" /></div>
                        <div><p className="font-medium text-[15px] text-white">Modo Emprendedor</p><p className="text-zinc-500 text-xs">Activa la sección para tu negocio</p></div>
                    </div>
                    <button onClick={() => setBusinessModeActive(!isBusinessModeActive)} className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${isBusinessModeActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${isBusinessModeActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            <p className="text-zinc-400 font-bold text-xs uppercase mb-2 ml-2">General</p>
            <div className="bg-zinc-900/50 rounded-2xl px-4 border border-zinc-800/50 mb-6">
                <MenuRow icon={Wallet} label="Mis Billeteras" onClick={() => setShowWallets(true)} />
                <MenuRow icon={LayoutGrid} label="Mis Categorías" onClick={() => setShowCategories(true)} />
                <MenuRow icon={Target} label="Mis Metas" to="/goals" />
                <MenuRow icon={MessageCircle} label="Chat con IA" to="/chat" />
            </div>
            <div className="bg-zinc-900/50 rounded-2xl px-4 border border-zinc-800/50 mb-8">
                <MenuRow icon={LogOut} label="Cerrar Sesión" onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} danger />
            </div>

            {showWallets && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 lg:items-center" onClick={() => { setShowWallets(false); resetWalletForm(); }}>
                    <div className="bg-zinc-950 rounded-t-3xl lg:rounded-3xl w-full max-w-lg border-t border-zinc-800 lg:border overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                            <h2 className="text-white text-lg font-bold">Mis Billeteras</h2>
                            <button onClick={() => { setShowWallets(false); resetWalletForm(); }} className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"><X size={18} className="text-zinc-400" /></button>
                        </div>
                        <div className="p-5">
                            {isAddingWallet ? (
                                <form onSubmit={handleSaveWallet} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-5 space-y-4">
                                    <h3 className="text-white font-bold">{editingWalletId ? 'Editar Cuenta' : 'Nueva Cuenta'}</h3>
                                    <div className="grid grid-cols-4 gap-1">
                                        {[{ v: 'debit', l: 'Débito' }, { v: 'savings', l: 'Ahorro' }, { v: 'credit_card', l: 'Crédito' }, { v: 'cash', l: 'Efectivo' }].map(({ v, l }) => (
                                            <button key={v} type="button" onClick={() => setWalletType(v as any)} className={`py-2 rounded-lg text-xs font-bold border ${walletType === v ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>{l}</button>
                                        ))}
                                    </div>
                                    {walletType !== 'cash' && (
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {BANKS_LIST.filter((b) => b !== 'Efectivo').map((b) => (
                                                <button key={b} type="button" onClick={() => setBankName(b)} className={`px-3 py-1.5 rounded-xl border flex-shrink-0 text-sm ${bankName === b ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400' : 'bg-zinc-950 border-zinc-800 text-zinc-400'}`}>{b}</button>
                                            ))}
                                        </div>
                                    )}
                                    <input required placeholder="Alias de la cuenta" value={walletName} onChange={(e) => setWalletName(e.target.value)} className="w-full h-11 bg-zinc-950 rounded-xl px-4 text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder-zinc-600" />
                                    <div className="flex gap-3">
                                        <div className="flex border border-zinc-800 rounded-xl overflow-hidden h-11 w-24">
                                            {(['NIO', 'USD'] as const).map((c) => (<button key={c} type="button" onClick={() => setWalletCurrency(c)} className={`flex-1 font-bold text-sm ${walletCurrency === c ? 'bg-indigo-600/20 text-indigo-400' : 'text-zinc-500'}`}>{c === 'NIO' ? 'C$' : '$'}</button>))}
                                        </div>
                                        <input type="number" step="0.01" placeholder="Balance" value={walletBalance} onChange={(e) => setWalletBalance(e.target.value)} className="flex-1 h-11 bg-zinc-950 rounded-xl px-4 text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder-zinc-600" />
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={resetWalletForm} className="flex-1 py-3 bg-zinc-800 rounded-xl text-white font-bold">Cancelar</button>
                                        <button type="submit" className="flex-1 py-3 bg-indigo-600 rounded-xl text-white font-bold">Guardar</button>
                                    </div>
                                </form>
                            ) : (
                                <button onClick={() => setIsAddingWallet(true)} className="w-full bg-indigo-600/15 border border-indigo-500/30 rounded-2xl py-4 flex items-center justify-center gap-2 mb-5 hover:bg-indigo-600/25 transition-colors">
                                    <Plus size={18} className="text-indigo-400" /><span className="text-indigo-400 font-bold">Añadir Nueva Cuenta</span>
                                </button>
                            )}
                            {Object.keys(grouped).map((bank) => (
                                <div key={bank} className="mb-4">
                                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: BANK_COLORS[bank] || '#a1a1aa' }}>{bank}</p>
                                    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
                                        {grouped[bank].map((w, i) => (
                                            <div key={w.id} className={`p-4 flex items-center ${i < grouped[bank].length - 1 ? 'border-b border-zinc-800' : ''}`}>
                                                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center mr-3">
                                                    {w.type === 'cash' ? <Banknote size={16} className="text-emerald-400" /> : w.type === 'credit_card' ? <CreditCard size={16} className="text-red-400" /> : w.type === 'savings' ? <PiggyBank size={16} className="text-purple-400" /> : <Landmark size={16} className="text-blue-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-bold text-sm truncate">{w.name}</p>
                                                    <p className="text-zinc-500 text-xs capitalize">{w.type === 'debit' ? 'Débito' : w.type === 'savings' ? 'Ahorros' : w.type === 'credit_card' ? 'Crédito' : 'Efectivo'}</p>
                                                </div>
                                                <p className={`font-black text-sm mr-3 ${w.type === 'credit_card' && Number(w.balance) > 0 ? 'text-red-400' : 'text-white'}`}>{w.currency === 'USD' ? '$' : 'C$'}{Number(w.balance).toFixed(2)}</p>
                                                <div className="flex flex-col gap-1">
                                                    <button onClick={() => { setEditingWalletId(w.id); setWalletName(w.name); setWalletType(w.type); setWalletCurrency(w.currency as any); setWalletBalance(w.balance.toString()); setBankName(w.bank_name || 'Otro'); setIsAddingWallet(true); }} className="p-1"><Pencil size={13} className="text-zinc-500" /></button>
                                                    <button onClick={() => { if (confirm(`¿Eliminar "${w.name}"?`)) deleteWallet(w.id); }} className="p-1"><Trash2 size={13} className="text-red-400/60" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showCategories && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 lg:items-center" onClick={() => setShowCategories(false)}>
                    <div className="bg-zinc-950 rounded-t-3xl lg:rounded-3xl w-full max-w-lg border-t border-zinc-800 lg:border overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                            <h2 className="text-white text-lg font-bold">Mis Categorías</h2>
                            <button onClick={() => setShowCategories(false)} className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"><X size={18} className="text-zinc-400" /></button>
                        </div>
                        <div className="p-5">
                            <form onSubmit={handleAddCategory} className="flex gap-2 mb-5">
                                <input required placeholder="Nueva categoría" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="flex-1 h-11 bg-zinc-900 rounded-xl px-4 text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder-zinc-600" />
                                <button type="submit" className="h-11 px-4 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500 transition-colors flex items-center gap-1"><Plus size={16} /> Añadir</button>
                            </form>
                            <div className="space-y-2">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="flex items-center justify-between bg-zinc-900 rounded-xl px-4 py-3">
                                        <span className="text-white font-medium">{cat.name}</span>
                                        {!cat.is_system && <button onClick={() => { if (confirm(`¿Eliminar "${cat.name}"?`)) deleteCategory(cat.id); }} className="text-red-400/50 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
