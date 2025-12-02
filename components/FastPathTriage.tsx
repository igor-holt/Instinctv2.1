import React, { useState } from 'react';
import { Icons } from './Icons';
import { classifyTaskEnergy } from '../services/geminiService';
import { TaskClassification } from '../types';

export const FastPathTriage = () => {
    const [task, setTask] = useState('');
    const [result, setResult] = useState<TaskClassification | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    const handleTriage = async () => {
        if (!task.trim()) return;
        setAnalyzing(true);
        setResult(null);
        
        const data = await classifyTaskEnergy(task);
        setResult(data);
        setAnalyzing(false);
    };

    return (
        <div className="glass-panel rounded-lg p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icons.Zap className="w-24 h-24 text-blue-400" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Icons.Layers className="text-blue-400" /> Task Energy Triage
            </h3>
            <p className="text-slate-400 text-sm mb-4">
                Enter a computational task to determine if it can run on the <b>Fast Path</b> (Flash-Lite) or requires <b>LID-LIFT</b> orchestration.
            </p>

            <div className="flex gap-2 mb-4">
                <input 
                    type="text"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="e.g., 'Extract IPs from this log' or 'Write a kernel driver'"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleTriage()}
                />
                <button 
                    onClick={handleTriage}
                    disabled={analyzing}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                    {analyzing ? 'Scanning...' : 'Triage'}
                </button>
            </div>

            {result && (
                <div className={`mt-4 p-4 rounded border ${result.route === 'FAST_PATH' ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-purple-900/20 border-purple-500/30'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <span className={`font-mono font-bold ${result.route === 'FAST_PATH' ? 'text-emerald-400' : 'text-purple-400'}`}>
                            {result.route === 'FAST_PATH' ? '✓ FAST PATH APPROVED' : '⚠ LID-LIFT REQUIRED'}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                             EST: {result.energyEstimate} J
                        </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mb-2 overflow-hidden">
                        <div 
                            className={`h-full ${result.route === 'FAST_PATH' ? 'bg-emerald-500' : 'bg-purple-500'}`} 
                            style={{width: `${result.complexity * 100}%`}}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-300 italic">{result.reasoning}</p>
                </div>
            )}
        </div>
    );
};