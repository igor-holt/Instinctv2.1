import React, { useState } from 'react';
import { Icons } from './Icons';
import { performWebSearch } from '../services/geminiService';

export const ResearchAgent = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ text: string, sources: any[] } | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        const data = await performWebSearch(query);
        setResults(data);
        setIsSearching(false);
    };

    return (
        <div className="glass-panel rounded-lg p-6 animate-in fade-in h-[600px] flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded bg-cyan-900/30 text-cyan-400">
                    <Icons.Globe className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Global Intelligence Uplink</h2>
                    <p className="text-slate-400 text-sm">External knowledge retrieval via Google Search Grounding.</p>
                </div>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Initiate global query..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-md pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                </div>
                <button 
                    type="submit"
                    disabled={isSearching}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-6 rounded-md font-medium transition-colors"
                >
                    {isSearching ? 'Scanning...' : 'Uplink'}
                </button>
            </form>

            <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded-lg border border-slate-800 p-6 relative">
                {results ? (
                    <div className="space-y-6">
                        <div className="prose prose-invert prose-sm max-w-none">
                            <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{results.text}</p>
                        </div>
                        
                        {results.sources.length > 0 && (
                            <div className="border-t border-slate-800 pt-4">
                                <h4 className="text-xs font-mono text-cyan-500 mb-3 uppercase tracking-wider">Verified Sources</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {results.sources.map((source, idx) => (
                                        <a 
                                            key={idx}
                                            href={source.uri}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-2 p-2 rounded bg-slate-800/50 hover:bg-slate-800 transition-colors group"
                                        >
                                            <div className="p-1 rounded bg-slate-700 text-slate-400 group-hover:text-white">
                                                <Icons.ExternalLink className="w-3 h-3" />
                                            </div>
                                            <span className="text-sm text-slate-300 group-hover:text-cyan-400 truncate">{source.title}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 opacity-50">
                        <Icons.Globe className="w-16 h-16 mb-4" />
                        <p className="font-mono text-sm">WAITING FOR INPUT</p>
                    </div>
                )}
            </div>
        </div>
    );
};