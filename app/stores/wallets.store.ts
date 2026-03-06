import { create } from 'zustand';
import { apiClient } from '../services/api';

export interface Wallet {
    id: string;
    name: string;
    type: 'debit' | 'savings' | 'credit_card' | 'cash';
    balance: number;
    currency: string;
    icon: string;
    bank_name: string;
    account_number?: string;
    credit_limit?: number;
}

interface WalletsState {
    wallets: Wallet[];
    isLoading: boolean;
    fetchWallets: () => Promise<void>;
    createWallet: (data: Omit<Wallet, 'id'>) => Promise<boolean>;
    updateWallet: (id: string, data: Partial<Wallet>) => Promise<boolean>;
    deleteWallet: (id: string) => Promise<boolean>;
}

export const useWalletsStore = create<WalletsState>((set, get) => ({
    wallets: [],
    isLoading: false,

    fetchWallets: async () => {
        set({ isLoading: true });
        try {
            const response = await apiClient.get('/wallets');
            set({ wallets: response.data?.data || [], isLoading: false });
        } catch (error) {
            console.error('Error fetching wallets:', error);
            set({ isLoading: false });
        }
    },

    createWallet: async (data) => {
        try {
            const response = await apiClient.post('/wallets', data);
            const newWallet = response.data?.data;
            if (newWallet) {
                set({ wallets: [newWallet, ...get().wallets] });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error creating wallet:', error);
            return false;
        }
    },

    updateWallet: async (id, data) => {
        try {
            const response = await apiClient.patch(`/wallets/${id}`, data);
            const updatedWallet = response.data?.data;
            if (updatedWallet) {
                set({ wallets: get().wallets.map((w) => (w.id === id ? updatedWallet : w)) });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating wallet:', error);
            return false;
        }
    },

    deleteWallet: async (id) => {
        try {
            await apiClient.delete(`/wallets/${id}`);
            set({ wallets: get().wallets.filter((w) => w.id !== id) });
            return true;
        } catch (error) {
            console.error('Error deleting wallet:', error);
            return false;
        }
    },
}));
