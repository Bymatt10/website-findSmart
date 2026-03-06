import { create } from 'zustand';
import { apiClient } from '../services/api';

export interface BusinessTransaction {
    id: string;
    product_name: string;
    description?: string;
    buy_cost: number;
    extra_costs: number;
    extra_costs_detail?: string;
    sell_price?: number;
    profit?: number;
    status: 'bought' | 'sold';
    currency: 'NIO' | 'USD';
    buy_date: string;
    sell_date?: string;
}

interface BusinessState {
    transactions: BusinessTransaction[];
    stats: {
        totalInvested: number;
        totalSold: number;
        netProfit: number;
        inventoryValue: number;
        profitByMonth: Record<string, number>;
    };
    isLoading: boolean;
    isBusinessModeActive: boolean;
    fetchAll: () => Promise<void>;
    fetchStats: () => Promise<void>;
    setBusinessModeActive: (val: boolean) => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
    transactions: [],
    stats: {
        totalInvested: 0,
        totalSold: 0,
        netProfit: 0,
        inventoryValue: 0,
        profitByMonth: {},
    },
    isLoading: false,
    isBusinessModeActive: false,

    setBusinessModeActive: (val: boolean) => set({ isBusinessModeActive: val }),

    fetchAll: async () => {
        set({ isLoading: true });
        try {
            const { data } = await apiClient.get('/business');
            set({ transactions: data?.data || [], isLoading: false });
        } catch (error) {
            console.error('Error fetching business transactions:', error);
            set({ isLoading: false });
        }
    },

    fetchStats: async () => {
        try {
            const { data } = await apiClient.get('/business/stats');
            set({
                stats: data?.data || {
                    totalInvested: 0,
                    totalSold: 0,
                    netProfit: 0,
                    inventoryValue: 0,
                    profitByMonth: {},
                },
            });
        } catch (error) {
            console.error('Error fetching business stats:', error);
        }
    },
}));
