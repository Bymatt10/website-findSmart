import { useState } from 'react';
import { PersonalDashboard } from '../components/PersonalDashboard';
import { BusinessDashboard } from '../components/BusinessDashboard';
import { useBusinessStore } from '../stores/business.store';
import { useDashboardStore } from '../stores/dashboard.store';
import { useCategoriesStore } from '../stores/categories.store';
import { useWalletsStore } from '../stores/wallets.store';
import { useCurrencyStore } from '../stores/currency.store';
import { apiClient } from '../services/api';
import { X, CreditCard, Landmark } from 'lucide-react';

// ─────────── Add Transaction Modal ───────────
function AddTransactionModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { categories, fetchCategories } = useCategoriesStore();
  const { wallets, fetchWallets } = useWalletsStore();
  const { currentRate, fetchRate } = useCurrencyStore();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'NIO' | 'USD'>('NIO');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isExpense, setIsExpense] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useState(() => {
    fetchCategories();
    fetchRate();
    fetchWallets();
  });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !merchant) { setError('Ingresa el monto y el comercio.'); return; }
    setError('');
    setLoading(true);
    try {
      const finalAmount = isExpense ? -Math.abs(Number(amount)) : Math.abs(Number(amount));
      await apiClient.post('/transactions', {
        amount: finalAmount,
        original_currency: currency,
        merchant_name: merchant,
        description,
        category_id: categoryId || undefined,
        wallet_id: walletId || undefined,
        date: new Date().toISOString(),
        source: 'manual',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error guardando transacción.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 lg:items-center" onClick={onClose}>
      <div
        className="bg-zinc-900 rounded-t-3xl lg:rounded-3xl p-6 w-full max-w-lg border-t border-zinc-800 lg:border max-w-screen-sm overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-bold">Registrar Movimiento</h2>
          <button onClick={onClose} className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors">
            <X size={18} className="text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Type */}
          <div className="flex bg-zinc-950 rounded-xl p-1 border border-zinc-800">
            {[{ label: 'Gasto', val: true }, { label: 'Ingreso', val: false }].map(({ label, val }) => (
              <button
                key={label}
                type="button"
                onClick={() => setIsExpense(val)}
                className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-colors ${isExpense === val ? (val ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white') : 'text-zinc-400'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="flex gap-3 items-center">
            <button
              type="button"
              onClick={() => setCurrency(currency === 'NIO' ? 'USD' : 'NIO')}
              className="bg-zinc-800 h-14 w-16 rounded-xl flex flex-col items-center justify-center border border-zinc-700 hover:bg-zinc-700 transition-colors flex-shrink-0"
            >
              <span className="text-white text-lg font-bold">{currency === 'USD' ? '$' : 'C$'}</span>
              <span className="text-zinc-500 text-[9px]">TAPEAR</span>
            </button>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`flex-1 h-14 bg-transparent text-4xl font-black focus:outline-none ${isExpense ? 'text-white' : 'text-emerald-400'} placeholder-zinc-700`}
            />
          </div>

          {currentRate && amount && (
            <p className="text-zinc-500 text-sm">
              ~ {currency === 'USD' ? 'C$' : '$'}
              {currency === 'USD' ? (Number(amount) * currentRate).toFixed(2) : (Number(amount) / currentRate).toFixed(2)}
              <span className="text-zinc-700 ml-2">(Tasa BCN: {currentRate})</span>
            </p>
          )}

          {/* Wallets */}
          {wallets.length > 0 && (
            <div>
              <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-2">Cuenta de Pago</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => { setWalletId(w.id); setCurrency(w.currency as any); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border flex-shrink-0 transition-colors ${walletId === w.id ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300' : 'border-zinc-800 bg-zinc-900 text-zinc-400'}`}
                  >
                    {w.type === 'credit_card' ? <CreditCard size={16} /> : <Landmark size={16} />}
                    <span className="text-sm font-medium whitespace-nowrap">{w.bank_name} - {w.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Merchant */}
          <div>
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-2">Comercio / Origen</label>
            <input
              required
              className="w-full h-12 bg-zinc-950 rounded-xl px-4 text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder-zinc-600 transition-colors"
              placeholder="Ej. Walmart, DiDi, Nómina"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider block mb-2">Descripción (opcional)</label>
            <input
              className="w-full h-12 bg-zinc-950 rounded-xl px-4 text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none placeholder-zinc-600 transition-colors"
              placeholder="Razón del gasto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Categoría</label>
                <span className="text-indigo-400 text-xs">Si dejas vacío, Gemini lo inferirá</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(categoryId === cat.id ? '' : cat.id)}
                    className={`px-3 py-2 rounded-xl border text-sm transition-colors ${categoryId === cat.id ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300' : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-indigo-600 rounded-xl text-white font-bold text-lg hover:bg-indigo-500 transition-colors disabled:opacity-60 flex items-center justify-center"
          >
            {loading ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Guardar Movimiento'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────── Home Page ───────────
export default function HomePage() {
  const { isBusinessModeActive } = useBusinessStore();
  const { fetchDashboardData } = useDashboardStore();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="h-full">
      {isBusinessModeActive
        ? <BusinessDashboard onAddProduct={() => setShowAddModal(true)} />
        : <PersonalDashboard onAddTransaction={() => setShowAddModal(true)} />
      }

      {showAddModal && !isBusinessModeActive && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => fetchDashboardData()}
        />
      )}
    </div>
  );
}
