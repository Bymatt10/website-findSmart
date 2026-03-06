import { create } from 'zustand';
import { apiClient } from '../services/api';

export interface Goal {
    id: string;
    title: string;
    current_amount: number;
    target_amount: number;
    target_currency?: 'NIO' | 'USD';
    deadline?: string;
    status: 'active' | 'completed';
}

interface GoalsState {
    goals: Goal[];
    isLoading: boolean;
    fetchGoals: (force?: boolean) => Promise<void>;
    addProgress: (id: string, amount: number) => Promise<void>;
    createGoal: (data: Omit<Goal, 'id' | 'current_amount' | 'status'>) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
    goals: [],
    isLoading: false,

    fetchGoals: async (force = false) => {
        if (!force && get().goals.length > 0) return;
        set({ isLoading: true });
        try {
            const response = await apiClient.get('/goals');
            set({ goals: response.data?.data || [], isLoading: false });
        } catch (error) {
            console.error('Error fetching goals:', error);
            set({ isLoading: false });
        }
    },

    addProgress: async (id: string, amount: number) => {
        try {
            const response = await apiClient.patch(`/goals/${id}/progress`, { amount_to_add: amount });
            const updatedGoal = response.data?.data;
            const goals = get().goals;
            set({ goals: goals.map((g) => (g.id === id ? updatedGoal : g)) });
        } catch (error) {
            console.error('Error updating goal progress:', error);
        }
    },

    createGoal: async (data) => {
        try {
            const response = await apiClient.post('/goals', data);
            const newGoal = response.data?.data;
            if (newGoal) set({ goals: [...get().goals, newGoal] });
        } catch (error) {
            console.error('Error creating goal:', error);
            throw error;
        }
    },
}));
