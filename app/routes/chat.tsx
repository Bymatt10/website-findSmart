import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../stores/chat.store';
import { Send, Trash2 } from 'lucide-react';

export default function ChatPage() {
    const { messages, isLoading, sendMessage, clearChat } = useChatStore();
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    function handleSend(e?: React.FormEvent) {
        e?.preventDefault();
        const text = inputText.trim();
        if (!text || isLoading) return;
        setInputText('');
        sendMessage(text);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-screen bg-zinc-950">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div>
                    <h1 className="text-white text-xl font-bold">Coach Financiero</h1>
                    <p className="text-zinc-500 text-xs">Powered by Gemini</p>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Limpiar chat"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <span className="text-6xl mb-4">🤖</span>
                        <h3 className="text-white text-xl font-bold mb-2">Hola, soy tu Coach.</h3>
                        <p className="text-zinc-500 max-w-sm leading-relaxed">
                            Puedes preguntarme sobre tu presupuesto, ideas para reducir gastos o consejos financieros basados en tu actividad.
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                        {!msg.isUser && (
                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                <span className="text-white text-[11px] font-bold">IA</span>
                            </div>
                        )}
                        <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.isUser
                                ? 'bg-indigo-600 rounded-br-sm text-white'
                                : 'bg-zinc-800 rounded-bl-sm text-zinc-100'
                                }`}
                        >
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <span className="w-4 h-4 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        El coach está escribiendo...
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-zinc-800 p-4">
                <div className="flex items-end gap-3">
                    <textarea
                        rows={1}
                        placeholder="Pregúntame algo de finanzas..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none text-[15px] leading-relaxed transition-colors min-h-[48px] max-h-[120px]"
                        style={{ height: 'auto' }}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || isLoading}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${inputText.trim() ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-zinc-800'}`}
                    >
                        <Send size={18} className={inputText.trim() ? 'text-white' : 'text-zinc-600'} />
                    </button>
                </div>
            </form>
        </div>
    );
}
