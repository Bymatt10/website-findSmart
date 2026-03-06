import { create } from 'zustand';
import { apiClient } from '../services/api';

interface DashboardState {
    transactions: any[];
    isLoading: boolean;
    totalBalance: number;
    totalExpenses: number;
    totalIncome: number;
    fetchDashboardData: (month?: number, year?: number) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    transactions: [],
    isLoading: false,
    totalBalance: 0,
    totalExpenses: 0,
    totalIncome: 0,

    fetchDashboardData: async (month?: number, year?: number) => {
        set({ isLoading: true });
        try {
            const params: Record<string, number> = {};
            if (month) params['month'] = month;
            if (year) params['year'] = year;

            const [transactionsRes, summaryRes] = await Promise.all([
                apiClient.get('/transactions', { params: { limit: 5 } }),
                apiClient.get('/transactions/summary', { params }),
            ]);

            const transactions = transactionsRes.data?.data || [];
            const summary = summaryRes.data?.data || { totalIncome: 0, totalExpense: 0, balance: 0 };

            const formattedTransactions = transactions.map((t: any) => ({
                id: t.id,
                name: t.merchant_name || t.description || 'Gasto',
                category: t.categories?.name || 'Sin Categoría',
                amount: Number(t.amount),
                date: new Date(t.date).toLocaleDateString(),
                icon: t.categories?.icon || 'MapPin',
                original_currency: t.original_currency,
                category_id: t.categories?.id,
                merchant_name: t.merchant_name,
            }));

            set({
                transactions: formattedTransactions,
                totalExpenses: summary.totalExpense,
                totalIncome: summary.totalIncome,
                totalBalance: summary.balance,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            set({ isLoading: false });
        }
    },

    deleteTransaction: async (id: string) => {
        try {
            await apiClient.delete(`/transactions/${id}`);
            get().fetchDashboardData();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    },
}));
