
import React, { useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { ChatMessage } from '../types';

interface ChatBotProps {
    messages: ChatMessage[];
    input: string;
    setInput: (val: string) => void;
    isLoading: boolean;
    onSend: (e: React.FormEvent) => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ messages, input, setInput, isLoading, onSend }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-[600px] glass-panel rounded-lg overflow-hidden animate-in fade-in">
            <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center gap-2">
                <Icons.Bot className="text-purple-400 w-5 h-5" />
                <h3 className="font-bold text-slate-200">KATIA (K8)</h3>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-400 border border-purple-500/30">
                    gemini-3-pro-preview
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 text-sm leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-800 text-slate-200 border border-slate-700'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-lg p-3 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={onSend} className="p-4 border-t border-slate-700 bg-slate-900/50">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Query KATIA..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-2 rounded-md transition-colors"
                    >
                        <Icons.Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};
