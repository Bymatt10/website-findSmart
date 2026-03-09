import { useState, useRef } from 'react';
import { apiClient } from '../services/api';
import { FileUp, FileText, CheckCircle2, AlertCircle, Save, UploadCloud, ArrowLeft, RefreshCw, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

interface ParsedTransaction {
    reference: string;
    date: string;
    concept: string;
    amount_nio: number;
    amount_usd: number;
    is_payment: boolean;
    card_holder: string;
    card_last4: string;
}

interface StatementInfo {
    account_number: string;
    client_name: string;
    credit_limit: string;
    cut_date: string;
    cut_year: number;
    payment_due_date: string;
    payment_due_nio: number;
    payment_due_usd: number;
    storage_path: string;
    transactions: ParsedTransaction[];
    totals: {
        purchases_nio: number;
        purchases_usd: number;
        payments_nio: number;
        payments_usd: number;
    };
}

export default function EstadoCuentaPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [statement, setStatement] = useState<StatementInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === 'application/pdf') {
            setFile(droppedFile);
            setError(null);
        } else {
            setError('Por favor sube un archivo PDF válido.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Por favor sube un archivo PDF válido.');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setStatement(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await apiClient.post('/upload/parse-statement', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // El backend tiene un ApiResponseInterceptor que envuelve la respuesta en { data: ... }
            setStatement(data.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al procesar el estado de cuenta.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!statement || statement.transactions.length === 0) return;

        setIsSaving(true);
        setError(null);
        let savedCount = 0;

        try {
            // Filter and prepare transactions
            // Se guardan los pagos como positivos y los gastos como negativos
            const toSave = statement.transactions.map((t) => {
                const isUSD = t.amount_usd > 0 && t.amount_nio === 0;
                const baseAmount = isUSD ? t.amount_usd : t.amount_nio;
                const finalAmount = t.is_payment ? baseAmount : -baseAmount; // Purchases are negative expenses
                
                return {
                    amount: finalAmount,
                    date: t.date,
                    description: `Ref: ${t.reference}`,
                    merchant_name: t.concept,
                    original_currency: isUSD ? 'USD' : 'NIO',
                    source: 'pdf',
                };
            });

            // Translate date from "DD/MMM/YY" to ISO "YYYY-MM-DD" for DB
            let isoDueDate = '';
            if (statement.payment_due_date) {
                const parts = statement.payment_due_date.split('/');
                if (parts.length === 3) {
                    const day = parts[0].padStart(2, '0');
                    const monthMap: Record<string, string> = {
                        'ENE': '01', 'FEB': '02', 'MAR': '03', 'ABR': '04',
                        'MAY': '05', 'JUN': '06', 'JUL': '07', 'AGO': '08',
                        'SEP': '09', 'OCT': '10', 'NOV': '11', 'DIC': '12',
                    };
                    const month = monthMap[parts[1]] || '01';
                    const year = `20${parts[2]}`;
                    isoDueDate = `${year}-${month}-${day}`;
                }
            }

            // Iterate and save sequentially to avoid overwhelming the DB/backend
            for (const tx of toSave) {
                await apiClient.post('/transactions', tx);
                savedCount++;
            }

            // Guardar recordatorio de pago si existe la fecha
            if (isoDueDate && (statement.payment_due_nio > 0 || statement.payment_due_usd > 0)) {
                try {
                    await apiClient.post('/reminders', {
                        title: `Pago Tarjeta ${statement.account_number || 'BAC'}`,
                        due_date: isoDueDate,
                        amount_nio: statement.payment_due_nio,
                        amount_usd: statement.payment_due_usd,
                        description: `Notificación automática de pago de estado de cuenta.`,
                        is_paid: false
                    });
                } catch (rErr) {
                    console.error('No se pudo guardar el recordatorio (podría no existir la tabla):', rErr);
                }
            }

            setSuccessMessage(`¡Se guardaron ${savedCount} transacciones con éxito y se agendó el recordatorio!`);
            setTimeout(() => {
                navigate('/transactions');
            }, 2500);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Error guardando las transacciones.');
        } finally {
            setIsSaving(false);
        }
    };

    const reset = () => {
        setFile(null);
        setStatement(null);
        setError(null);
        setSuccessMessage(null);
    };

    return (
        <div className="px-5 pt-6 pb-20 max-w-4xl mx-auto min-h-screen">
            <div className="flex items-center gap-3 mb-6">
                <Link to="/" className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 hover:bg-zinc-800 transition-colors">
                    <ArrowLeft size={20} className="text-zinc-400" />
                </Link>
                <div>
                    <h1 className="text-white text-3xl font-extrabold tracking-tight">Estado de Cuenta</h1>
                    <p className="text-zinc-500 text-sm mt-1">Sube tu PDF para auto-registrar tus gastos</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3 mb-6">
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-start gap-3 mb-6">
                    <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-medium">{successMessage}</p>
                </div>
            )}

            {!statement && !isLoading && !successMessage && (
                <div
                    className={`border-2 border-dashed rounded-3xl p-8 transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900'
                        } flex flex-col items-center justify-center text-center`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                        {file ? (
                            <FileText size={40} className="text-indigo-400" />
                        ) : (
                            <UploadCloud size={40} className="text-indigo-400" />
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {file ? file.name : 'Sube tu estado de cuenta'}
                    </h3>
                    <p className="text-zinc-500 text-sm mb-8 max-w-xs">
                        {file ? 'Listo para ser analizado.' : 'Arrastra un PDF aquí, o haz clic para buscarlo en tus archivos. (Formato BAC aceptado).'}
                    </p>

                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <div className="flex gap-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-colors"
                        >
                            {file ? 'Cambiar archivo' : 'Elegir archivo'}
                        </button>

                        {file && (
                            <button
                                onClick={handleUpload}
                                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors flex items-center gap-2"
                            >
                                <FileUp size={18} />
                                Extraer Transacciones
                            </button>
                        )}
                    </div>
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-bold text-white mb-2">Analizando Documento...</h3>
                    <p className="text-zinc-500 text-sm">Extrayendo transacciones y montos</p>
                </div>
            )}

            {statement && (
                <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Previsualización</h2>
                            <p className="text-zinc-500 text-sm">
                                Se encontraron <span className="text-indigo-400 font-bold">{statement.transactions.length}</span> transacciones. 
                                <span className="ml-1 text-zinc-400 text-xs">(Nota: El "Saldo o Contado a pagar" es la resta de Gastos menos Pagos)</span>
                            </p>
                        </div>
                        <button
                            onClick={reset}
                            className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 hover:bg-zinc-800 transition-colors"
                            title="Subir otro archivo"
                        >
                            <RefreshCw size={18} className="text-zinc-400" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-2">
                        <div className="flex-1 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <div className="text-indigo-400 font-semibold mb-1 text-sm uppercase tracking-wider">Pago de Contado (NIO)</div>
                                <div className="text-white font-black text-2xl">C$ {statement.payment_due_nio.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</div>
                            </div>
                            
                            <div className="hidden md:block w-px h-12 bg-indigo-500/20"></div>

                            <div>
                                <div className="text-indigo-400 font-semibold mb-1 text-sm uppercase tracking-wider">Pago de Contado (USD)</div>
                                <div className="text-white font-black text-2xl">$ {statement.payment_due_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            </div>

                            <div className="hidden md:block w-px h-12 bg-indigo-500/20"></div>

                            <div className="text-left md:text-right">
                                <div className="text-indigo-400 font-semibold mb-1 text-sm uppercase tracking-wider">Fecha Límite</div>
                                <div className="text-white font-bold text-lg">{statement.payment_due_date || 'No detectada'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800/80">
                            <div className="flex items-center gap-3 mb-2 text-zinc-400">
                                <CreditCard size={18} />
                                <span className="font-semibold text-sm">Tarjeta</span>
                            </div>
                            <p className="text-white font-bold text-lg">{statement.account_number || 'No detectada'}</p>
                        </div>
                        
                        {/* NIO CARDS */}
                        <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800/80">
                            <div className="flex items-center gap-2 mb-2 text-red-400">
                                <ArrowLeft size={16} className="scale-x-[-1] rotate-45" />
                                <span className="font-semibold text-xs">Gastos (C$)</span>
                            </div>
                            <span className="text-white font-bold text-lg">C$ {statement.totals.purchases_nio.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800/80">
                            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                <ArrowLeft size={16} className="-rotate-45" />
                                <span className="font-semibold text-xs">Pagos (C$)</span>
                            </div>
                            <span className="text-white font-bold text-lg">C$ {statement.totals.payments_nio.toLocaleString('es-NI', { minimumFractionDigits: 2 })}</span>
                        </div>

                        {/* USD CARDS */}
                        {statement.totals.purchases_usd > 0 || statement.totals.payments_usd > 0 ? (
                            <>
                                <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800/80">
                                    <div className="flex items-center gap-2 mb-2 text-red-400">
                                        <ArrowLeft size={16} className="scale-x-[-1] rotate-45" />
                                        <span className="font-semibold text-xs">Gastos ($)</span>
                                    </div>
                                    <span className="text-white font-bold text-lg">$ {statement.totals.purchases_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800/80">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                                        <ArrowLeft size={16} className="-rotate-45" />
                                        <span className="font-semibold text-xs">Pagos ($)</span>
                                    </div>
                                    <span className="text-white font-bold text-lg">$ {statement.totals.payments_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </>
                        ) : null}
                    </div>

                    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-wider">
                                        <th className="px-4 py-3 font-medium">Fecha</th>
                                        <th className="px-4 py-3 font-medium">Concepto</th>
                                        <th className="px-4 py-3 font-medium text-right">Monto (C$)</th>
                                        <th className="px-4 py-3 font-medium text-right">Monto ($)</th>
                                        <th className="px-4 py-3 font-medium text-center">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    {statement.transactions.map((t, idx) => (
                                        <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                                            <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">{t.date}</td>
                                            <td className="px-4 py-3 text-sm text-white font-medium">
                                                <div className="max-w-[200px] md:max-w-xs truncate" title={t.concept}>
                                                    {t.concept}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-300 text-right whitespace-nowrap">
                                                {t.amount_nio > 0 ? t.amount_nio.toLocaleString('es-NI', { minimumFractionDigits: 2 }) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-zinc-300 text-right whitespace-nowrap">
                                                {t.amount_usd > 0 ? t.amount_usd.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.is_payment ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {t.is_payment ? 'Pago' : 'Gasto'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-8 py-3.5 rounded-xl text-white font-bold flex items-center gap-2 transition-all shadow-lg ${isSaving ? 'bg-zinc-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20 hover:shadow-indigo-500/40'}`}
                        >
                            {isSaving ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Guardar Transacciones
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
