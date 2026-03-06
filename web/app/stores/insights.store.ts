import { create } from 'zustand';
import { apiClient } from '../services/api';

export interface Insight {
    id: string;
    insight_text?: string;
    text?: string;
    insight_type?: 'spending_alert' | 'saving_tip' | 'pattern' | 'trend' | 'goal_progress' | 'action';
    type?: string;
    metadata?: any;
    is_read?: boolean;
    created_at?: string;
}

export interface InsightsDashboardData {
    dailyInsight: Insight | null;
    trends: Insight[];
    alerts: Insight[];
    goals: any[];
    recommendedAction: Insight | null;
}

interface InsightsState {
    insights: Insight[];
    dashboard: InsightsDashboardData | null;
    isLoading: boolean;
    fetchInsights: () => Promise<void>;
    fetchInsightsDashboard: (force?: boolean) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
}

export const useInsightsStore = create<InsightsState>((set, get) => ({
    insights: [],
    dashboard: null,
    isLoading: false,

    fetchInsights: async () => {
        set({ isLoading: true });
        try {
            const response = await apiClient.get('/insights');
            set({ insights: response.data?.data || [], isLoading: false });
        } catch (error) {
            console.error('Error fetching insights:', error);
            set({ isLoading: false });
        }
    },

    fetchInsightsDashboard: async (force = false) => {
        if (!force && get().dashboard) return;
        set({ isLoading: true });
        try {
            const response = await apiClient.get('/insights/dashboard');
            set({ dashboard: response.data?.data || null, isLoading: false });
        } catch (error) {
            console.error('Error fetching insights dashboard:', error);
            set({ isLoading: false });
        }
    },

    markAsRead: async (id: string) => {
        try {
            await apiClient.patch(`/insights/${id}/read`);
            const insights = get().insights;
            set({ insights: insights.map((i) => (i.id === id ? { ...i, is_read: true } : i)) });
        } catch (error) {
            console.error('Error marking insight as read:', error);
        }
    },
}));
