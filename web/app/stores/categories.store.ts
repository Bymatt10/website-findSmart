import { create } from 'zustand';
import { apiClient } from '../services/api';

export interface Category {
    id: string;
    name: string;
    icon: string;
    is_system: boolean;
}

interface CategoriesState {
    categories: Category[];
    isLoading: boolean;
    fetchCategories: () => Promise<void>;
    createCategory: (name: string, icon: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
    categories: [],
    isLoading: false,

    fetchCategories: async () => {
        set({ isLoading: true });
        try {
            const response = await apiClient.get('/categories');
            set({ categories: response.data?.data || [], isLoading: false });
        } catch (error) {
            console.error('Error fetching categories:', error);
            set({ isLoading: false });
        }
    },

    createCategory: async (name: string, icon: string) => {
        try {
            const response = await apiClient.post('/categories', { name, icon });
            const newCategory = response.data?.data;
            set({ categories: [...get().categories, newCategory] });
        } catch (error: any) {
            console.error('Error creating category:', error.response?.data || error.message);
            throw error;
        }
    },

    deleteCategory: async (id: string) => {
        try {
            await apiClient.delete(`/categories/${id}`);
            set({ categories: get().categories.filter((c) => c.id !== id) });
        } catch (error: any) {
            console.error('Error deleting category:', error.response?.data || error.message);
            throw error;
        }
    },
}));
