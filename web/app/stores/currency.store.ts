import { create } from 'zustand';
import { apiClient } from '../services/api';

interface CurrencyState {
    currentRate: number | null;
    isLoading: boolean;
    fetchRate: () => Promise<void>;
    convert: (amount: number, from: 'NIO' | 'USD', to: 'NIO' | 'USD') => Promise<{ result: number; rate: number } | null>;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
    currentRate: null,
    isLoading: false,

    fetchRate: async () => {
        set({ isLoading: true });
        try {
            const response = await apiClient.get('/currency/rate');
            set({ currentRate: response.data?.data?.rate, isLoading: false });
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            set({ isLoading: false });
        }
    },

    convert: async (amount: number, from: 'NIO' | 'USD', to: 'NIO' | 'USD') => {
        try {
            const response = await apiClient.post('/currency/convert', { amount, from, to });
            return response.data?.data;
        } catch (error) {
            console.error('Error converting currency:', error);
            return null;
        }
    },
}));
