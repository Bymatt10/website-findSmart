import { create } from 'zustand';
import { apiClient } from '../services/api';

export interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    sendMessage: (text: string) => Promise<void>;
    clearChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    messages: [],
    isLoading: false,

    sendMessage: async (text: string) => {
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text,
            isUser: true,
            timestamp: new Date(),
        };

        const historyForApi = get().messages.map((m) => ({
            role: m.isUser ? 'user' : 'assistant',
            text: m.text,
        }));

        set((state) => ({ messages: [...state.messages, userMsg], isLoading: true }));

        try {
            const response = await apiClient.post('/insights/chat', {
                message: text,
                history: historyForApi,
            });
            const botText = response.data?.data?.reply || response.data?.reply || 'Error obteniendo respuesta.';
            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: botText,
                isUser: false,
                timestamp: new Date(),
            };
            set((state) => ({ messages: [...state.messages, botMsg], isLoading: false }));
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Hubo un error contactando a tu coach. Verifica tu conexión.',
                isUser: false,
                timestamp: new Date(),
            };
            set((state) => ({ messages: [...state.messages, errorMsg], isLoading: false }));
        }
    },

    clearChat: () => set({ messages: [], isLoading: false }),
}));
