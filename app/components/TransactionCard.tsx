import { getCategoryColor } from '../lib/categories';
import {
    ShoppingBag, Car, Home, Music, Heart, GraduationCap, Shirt, Zap,
    Package, Coffee, ShoppingCart, ArrowLeftRight, MapPin, Pencil, Trash2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
    ShoppingBag, Car, Home, Music, Heart, GraduationCap, Shirt, Zap,
    Package, Coffee, ShoppingCart, ArrowLeftRight, MapPin,
};

export interface Transaction {
    id: string;
    name: string;
    category: string;
    amount: number;
    date: string;
    icon?: string;
    original_currency?: 'NIO' | 'USD';
    category_id?: string;
    merchant_name?: string;
}

interface TransactionCardProps {
    transaction: Transaction;
    onEdit?: () => void;
    onDelete?: (id: string) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
    const isExpense = transaction.amount < 0;
    const color = getCategoryColor(transaction.category);
    const IconComp = ICON_MAP[transaction.icon || ''] || MapPin;
    const currSymbol = transaction.original_currency === 'USD' ? '$' : 'C$';

    return (
        <div className="flex items-center py-4 border-b border-zinc-200 dark:border-zinc-800/50">
            {/* Icon */}
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0"
                style={{ backgroundColor: `${color}15` }}
            >
                <IconComp size={22} style={{ color }} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-zinc-900 dark:text-white font-semibold text-[15px] truncate">{transaction.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{transaction.category}</p>
            </div>

            {/* Amount & actions */}
            <div className="flex flex-col items-end ml-2">
                <span className={`font-bold text-[15px] ${isExpense ? 'text-zinc-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {isExpense ? '-' : '+'}{currSymbol}{Math.abs(transaction.amount).toFixed(2)}
                </span>
                <div className="flex items-center gap-1 mt-1.5">
                    <span className="text-zinc-600 text-[10px] mr-1">{transaction.date}</span>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-1 bg-zinc-800/50 rounded-lg hover:bg-zinc-700/50 transition-colors"
                        >
                            <Pencil size={12} className="text-zinc-400" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(transaction.id)}
                            className="p-1 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                            <Trash2 size={12} className="text-red-400" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
