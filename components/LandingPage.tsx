
import React from 'react';
import { Icons } from './Icons';
import { PAPER_MODULES, TERMINOLOGY } from '../constants';
import { ThermodynamicMonitor } from './ThermodynamicMonitor';
import { FastPathTriage } from './FastPathTriage';

interface LandingPageProps {
    onNavigate: (tabId: string) => void;
    stats: Record<string, { views: number | string, downloads: number | string }>;
    aggregateStats: { views: number | string, downloads: number | string };
    loading: boolean;
    tourStep: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, stats, aggregateStats, loading, tourStep }) => {
    
    // Helper to determine card visual state
    // tourStep mapping: 0 -> p2 (Phase 1) target, 1 -> p1 (Phase 2) target, 2 -> p3 (Phase 3) target
    const getPhaseStatus = (targetStep: number) => {
        if (tourStep > targetStep) return 'completed';
        if (tourStep === targetStep) return 'active';
        return 'pending';
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-12 overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                     <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-slate-900/0 to-transparent animate-spin-slow"></div>
                </div>
                
                <div className="relative z-10 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 font-mono text-xs mb-6">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        SYSTEM ONLINE v2.1
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        The Instinct Platform
                    </h1>
                    <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-8">
                        Experience <b>Energentic Intelligence</b>: a decision-making paradigm where thermodynamic constraints are primary survival inputs.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={() => onNavigate('p2')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-900/20 animate-pulse"
                        >
                            Start the Tour
                        </button>
                        <button 
                            onClick={() => onNavigate('synthesis')}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-lg font-bold border border-slate-700 transition-all"
                        >
                            View Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Guided Tour Section */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded bg-purple-900/30 text-purple-400">
                        <Icons.Map className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Architectural Tour</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connector Line */}
                    <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-slate-800 -z-10"></div>

                    {/* Step 1: P2 (Target Step 0) */}
                    <div className="relative group cursor-pointer" onClick={() => onNavigate('p2')}>
                        {getPhaseStatus(0) === 'active' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 animate-bounce">
                                NEXT STEP
                            </div>
                        )}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all z-10 ${
                            getPhaseStatus(0) === 'active' 
                            ? 'bg-slate-900 border-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-110' 
                            : getPhaseStatus(0) === 'completed'
                                ? 'bg-amber-900/20 border border-amber-500/50 text-amber-500'
                                : 'bg-slate-900 border border-slate-700 opacity-60'
                        }`}>
                            {getPhaseStatus(0) === 'completed' ? <Icons.CheckCircle2 className="w-8 h-8" /> : <Icons.Thermometer className={`w-8 h-8 ${getPhaseStatus(0) === 'active' ? 'text-amber-400' : 'text-slate-500'}`} />}
                        </div>
                        <div className={`text-center p-6 rounded-xl border transition-colors ${
                            getPhaseStatus(0) === 'active'
                            ? 'bg-slate-900/80 border-amber-500/50'
                            : 'bg-slate-900/50 border-slate-800'
                        }`}>
                            <span className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider block mb-2">Phase 1: The Constraint</span>
                            <h3 className="text-lg font-bold text-white mb-2">Thermodynamic Limits</h3>
                            <p className="text-sm text-slate-400">Discover how the <b>Landauer Limit</b> defines the absolute physical floor for computational efficiency.</p>
                        </div>
                    </div>

                    {/* Step 2: P1 (Target Step 1) */}
                    <div className="relative group cursor-pointer" onClick={() => onNavigate('p1')}>
                        {getPhaseStatus(1) === 'active' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 animate-bounce">
                                NEXT STEP
                            </div>
                        )}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all z-10 ${
                            getPhaseStatus(1) === 'active' 
                            ? 'bg-slate-900 border-2 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-110' 
                            : getPhaseStatus(1) === 'completed'
                                ? 'bg-purple-900/20 border border-purple-500/50 text-purple-500'
                                : 'bg-slate-900 border border-slate-700 opacity-60'
                        }`}>
                            {getPhaseStatus(1) === 'completed' ? <Icons.CheckCircle2 className="w-8 h-8" /> : <Icons.Brain className={`w-8 h-8 ${getPhaseStatus(1) === 'active' ? 'text-purple-400' : 'text-slate-500'}`} />}
                        </div>
                        <div className={`text-center p-6 rounded-xl border transition-colors ${
                            getPhaseStatus(1) === 'active'
                            ? 'bg-slate-900/80 border-purple-500/50'
                            : 'bg-slate-900/50 border-slate-800'
                        }`}>
                            <span className="text-purple-500 font-mono text-xs font-bold uppercase tracking-wider block mb-2">Phase 2: The Solution</span>
                            <h3 className="text-lg font-bold text-white mb-2">LID-LIFT Protocol</h3>
                            <p className="text-sm text-slate-400">Explore the orchestration layer that gates complex reasoning based on energy availability.</p>
                        </div>
                    </div>

                    {/* Step 3: P3 (Target Step 2) */}
                    <div className="relative group cursor-pointer" onClick={() => onNavigate('p3')}>
                        {getPhaseStatus(2) === 'active' && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-20 animate-bounce">
                                NEXT STEP
                            </div>
                        )}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all z-10 ${
                            getPhaseStatus(2) === 'active' 
                            ? 'bg-slate-900 border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-110' 
                            : getPhaseStatus(2) === 'completed'
                                ? 'bg-emerald-900/20 border border-emerald-500/50 text-emerald-500'
                                : 'bg-slate-900 border border-slate-700 opacity-60'
                        }`}>
                            {getPhaseStatus(2) === 'completed' ? <Icons.CheckCircle2 className="w-8 h-8" /> : <Icons.Trash2 className={`w-8 h-8 ${getPhaseStatus(2) === 'active' ? 'text-emerald-400' : 'text-slate-500'}`} />}
                        </div>
                        <div className={`text-center p-6 rounded-xl border transition-colors ${
                            getPhaseStatus(2) === 'active'
                            ? 'bg-slate-900/80 border-emerald-500/50'
                            : 'bg-slate-900/50 border-slate-800'
                        }`}>
                            <span className="text-emerald-500 font-mono text-xs font-bold uppercase tracking-wider block mb-2">Phase 3: The Maintenance</span>
                            <h3 className="text-lg font-bold text-white mb-2">Context Hygiene</h3>
                            <p className="text-sm text-slate-400">Learn how <b>Dissonance Eviction</b> keeps agents sane by purging conflicting memory fragments.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Terminology Codex */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded bg-blue-900/30 text-blue-400">
                            <Icons.Book className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Terminology Codex</h2>
                    </div>
                    <div className="space-y-4">
                        {TERMINOLOGY.map((item, idx) => (
                            <div key={idx} className="group">
                                <div className="flex items-baseline justify-between mb-1">
                                    <h3 className="font-mono text-sm font-bold text-blue-300 group-hover:text-blue-400 transition-colors">{item.term}</h3>
                                    <span className="text-[10px] text-slate-600 uppercase border border-slate-800 px-1.5 rounded">{item.category}</span>
                                </div>
                                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{item.definition}</p>
                                {idx !== TERMINOLOGY.length - 1 && <div className="h-px bg-slate-800/50 mt-4"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Code Vault */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded bg-slate-700 text-slate-200">
                            <Icons.Code className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Code Architecture</h2>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                                <Icons.Zap className="w-3 h-3 text-amber-400" />
                                Landauer Efficiency Formula
                            </h3>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-amber-400">
                                E_min = k_B * T * ln(2)
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Calculates the physical lower bound for bit erasure.</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                                <Icons.Brain className="w-3 h-3 text-purple-400" />
                                Impasse Detection Logic
                            </h3>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-purple-400">
                                S = Goal ∩ Tools ∩ Context = ∅
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Triggers LID-LIFT when agent capabilities cannot meet goal requirements.</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                                <Icons.Trash2 className="w-3 h-3 text-emerald-400" />
                                Memory Eviction Score
                            </h3>
                            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-emerald-400">
                                S(m) = (1 / Δt^α) · (1 - λ · D(m, P))
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Prioritizes eviction based on both time decay and semantic dissonance.</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => onNavigate('synthesis')}
                        className="w-full mt-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        View Full System Synthesis <Icons.ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
