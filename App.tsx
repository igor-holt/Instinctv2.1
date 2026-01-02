
import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Icons } from './components/Icons';
import { PAPER_MODULES } from './constants';
import { ThermodynamicMonitor } from './components/ThermodynamicMonitor';
import { ChatBot } from './components/ChatBot';
import { FastPathTriage } from './components/FastPathTriage';
import { ImageEditor } from './components/ImageEditor';
import { ResearchAgent } from './components/ResearchAgent';
import { LandingPage } from './components/LandingPage';
import { analyzeResearchSection, streamChatMessage } from './services/geminiService';
import { ChatMessage } from './types';

export default function App() {
    const [activeTab, setActiveTab] = useState('landing');
    const [subView, setSubView] = useState<'overview' | 'paper'>('overview');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [stats, setStats] = useState<Record<string, { views: number | string, downloads: number | string }>>({});
    const [aggregateStats, setAggregateStats] = useState({ views: 0, downloads: 0 });
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Tour State: 0=Start, 1=P2(Thermo), 2=P1(LID-LIFT), 3=P3(Memory), 4=Synthesis
    const [tourStep, setTourStep] = useState(0);
    
    // Lifted Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'I am KATIA (K8), your Automated Techno-Intelligent Assistant. I employ AVKO principles to optimize complex processes through Tree-of-Thought reasoning. How can I assist you?', timestamp: new Date() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Highlight State
    const [highlightText, setHighlightText] = useState<string | null>(null);
    const [highlightPos, setHighlightPos] = useState<{top: number, left: number} | null>(null);

    const mainContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchZenodoStats = async () => {
            const newStats: Record<string, { views: number | string, downloads: number | string }> = {};
            let totalViews = 0;
            let totalDownloads = 0;

            for (const key of Object.keys(PAPER_MODULES)) {
                const paper = PAPER_MODULES[key as keyof typeof PAPER_MODULES];
                if (paper.zenodoId) {
                    try {
                        const res = await fetch(`https://zenodo.org/api/records/${paper.zenodoId}`);
                        if (res.ok) {
                            const data = await res.json();
                            const s = data.stats || { views: 0, downloads: 0 };
                            newStats[paper.id] = { views: s.views, downloads: s.downloads };
                            totalViews += s.views;
                            totalDownloads += s.downloads;
                        } else {
                            newStats[paper.id] = { views: "—", downloads: "—" };
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch stats for ${paper.id}`, e);
                        newStats[paper.id] = { views: "—", downloads: "—" };
                    }
                } else {
                    newStats[paper.id] = { views: "N/A", downloads: "N/A" };
                }
            }
            setStats(newStats);
            setAggregateStats({ views: totalViews, downloads: totalDownloads });
            setLoading(false);
        };

        fetchZenodoStats();
        const interval = setInterval(fetchZenodoStats, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeTab, subView]);

    // Highlight detection
    useEffect(() => {
        const handleMouseUp = () => {
            const selection = window.getSelection();
            if (selection && selection.toString().trim().length > 0) {
                const text = selection.toString().trim();
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                // Adjust for scroll container if needed, but client rect is viewport relative
                setHighlightText(text);
                setHighlightPos({
                    top: rect.bottom + 10,
                    left: rect.left + (rect.width / 2)
                });
            } else {
                setHighlightText(null);
                setHighlightPos(null);
            }
        };

        const container = mainContentRef.current;
        if (container) {
            container.addEventListener('mouseup', handleMouseUp);
            // Also add touchend for mobile text selection support
            container.addEventListener('touchend', handleMouseUp);
        }
        return () => {
            if (container) {
                container.removeEventListener('mouseup', handleMouseUp);
                container.removeEventListener('touchend', handleMouseUp);
            }
        };
    }, []);

    const handleChatSend = async (e?: React.FormEvent, overrideText?: string) => {
        if (e) e.preventDefault();
        const textToSend = overrideText || chatInput;
        if (!textToSend.trim() || isChatLoading) return;

        const userMsg: ChatMessage = { role: 'user', text: textToSend, timestamp: new Date() };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        const historyForApi = chatMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        let responseText = "";
        const modelMsgPlaceholder: ChatMessage = { role: 'model', text: '', timestamp: new Date() };
        setChatMessages(prev => [...prev, modelMsgPlaceholder]);

        try {
            const stream = streamChatMessage(historyForApi, userMsg.text);
            for await (const chunk of stream) {
                if (chunk === "API_KEY_MISSING") {
                    responseText = "System Error: API_KEY not found.";
                    break;
                }
                responseText += chunk;
                setChatMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], text: responseText };
                    return newMsgs;
                });
            }
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'model', text: 'Connection to KATIA severed.', timestamp: new Date() }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleExplainHighlight = () => {
        if (!highlightText) return;
        setActiveTab('chat');
        setHighlightText(null);
        setHighlightPos(null);
        handleChatSend(undefined, `Could you explain the term "${highlightText}" in the context of the Instinct Platform?`);
    };

    const handleAnalyze = async (text: string, sectionId: string) => {
        setAnalyzingId(sectionId);
        setAnalysisResult("Analyzing with Gemini...");
        const res = await analyzeResearchSection(text);
        setAnalysisResult(res || "Error analyzing content.");
        setAnalyzingId(null);
    };

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setSubView('overview');
        setMobileMenuOpen(false); // Close menu on mobile when navigating

        // Tour Progression Logic
        if (tourStep === 0 && tabId === 'p2') setTourStep(1);
        else if (tourStep === 1 && tabId === 'p1') setTourStep(2);
        else if (tourStep === 2 && tabId === 'p3') setTourStep(3);
        else if (tourStep === 3 && tabId === 'synthesis') setTourStep(4);
    };

    const renderContent = () => {
        if (activeTab === 'landing') {
            return <LandingPage 
                onNavigate={handleTabChange} 
                stats={stats} 
                aggregateStats={aggregateStats} 
                loading={loading}
                tourStep={tourStep}
            />;
        } else if (activeTab === 'synthesis') {
            return (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            <Icons.Layers className="text-blue-400" /> System Synthesis
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base max-w-3xl">
                            The <span className="text-blue-400 font-mono">LID-LIFT Orchestrator v1.4</span> is not a single algorithm, but a triad of interacting systems. 
                            The Metacognitive layer directs the agent, while the Physics layer constrains it.
                        </p>
                    </div>

                    {/* Live Impact Card - Mobile Responsive */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="p-3 bg-blue-500/20 rounded-full text-blue-400 shrink-0">
                                <Icons.Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">Live Research Impact</h3>
                                <p className="text-slate-400 text-xs font-mono">ZENODO API AGGREGATION</p>
                            </div>
                        </div>
                        <div className="flex gap-4 md:gap-8 text-center w-full md:w-auto justify-center md:justify-end">
                            <div className="flex-1 md:flex-none">
                                <div className="text-2xl font-bold text-white flex items-center gap-2 justify-center">
                                    {loading ? <span className="animate-pulse">...</span> : aggregateStats.views.toLocaleString()}
                                    <Icons.Eye className="w-4 h-4 text-slate-500" />
                                </div>
                                <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider">Total Views</p>
                            </div>
                            <div className="w-px bg-slate-700 h-10"></div>
                            <div className="flex-1 md:flex-none">
                                <div className="text-2xl font-bold text-white flex items-center gap-2 justify-center">
                                    {loading ? <span className="animate-pulse">...</span> : aggregateStats.downloads.toLocaleString()}
                                    <Icons.Download className="w-4 h-4 text-slate-500" />
                                </div>
                                <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider">Total Downloads</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ThermodynamicMonitor />
                        <FastPathTriage />
                    </div>

                    {/* Paper Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Object.values(PAPER_MODULES).map((paper: any) => {
                             const Icon = Icons[paper.icon as keyof typeof Icons] || Icons.BookOpen;
                             const s = stats[paper.id];
                             return (
                                <div 
                                    key={paper.id}
                                    onClick={() => handleTabChange(paper.id)}
                                    className="group cursor-pointer bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all duration-300 p-5 rounded-lg relative active:scale-95 md:active:scale-100"
                                >
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Icons.ArrowRight className={`w-5 h-5 ${paper.color}`} />
                                    </div>
                                    <div className={`w-10 h-10 rounded-lg bg-slate-900/50 flex items-center justify-center mb-4 ${paper.color} group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-200 mb-1">{paper.title}</h3>
                                    <p className={`text-xs font-mono mb-3 ${paper.color} opacity-80`}>{paper.subtitle}</p>
                                    
                                    <div className="flex flex-col gap-2">
                                        {paper.zenodoId && (
                                            <div className="group/tooltip relative w-fit">
                                                <span className="text-[10px] text-slate-600 font-mono border border-slate-800 bg-slate-900/50 px-1.5 py-0.5 rounded">
                                                    DOI: ...{paper.zenodoId.slice(-4)}
                                                </span>
                                                {/* Tooltip hidden on mobile interactions usually, but accessible via tap-hold if browser supports */}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Icons.Eye className="w-3 h-3"/> 
                                                {s ? s.views : <span className="animate-pulse">...</span>}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icons.Download className="w-3 h-3"/> 
                                                {s ? s.downloads : <span className="animate-pulse">...</span>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
            );
        } else if (activeTab === 'chat') {
            return <ChatBot 
                messages={chatMessages} 
                input={chatInput} 
                setInput={setChatInput} 
                isLoading={isChatLoading} 
                onSend={handleChatSend} 
            />;
        } else if (activeTab === 'visual') {
            return <ImageEditor />;
        } else if (activeTab === 'research') {
            return <ResearchAgent />;
        } else {
            // Specific Paper Detail View
            const paper = PAPER_MODULES[activeTab as keyof typeof PAPER_MODULES];
            const MainIcon = Icons[paper.icon as keyof typeof Icons] || Icons.BookOpen;
            const s = stats[paper.id];

            if (subView === 'paper') {
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 max-w-4xl mx-auto py-4 md:py-8">
                        <div className={`bg-gradient-to-r ${paper.bgGradient} border-b border-slate-700 p-6 md:p-8 rounded-lg mb-8`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-3 rounded-lg bg-slate-900 ${paper.color}`}>
                                    <Icons.FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white">Hosted Whitepaper</h2>
                                    <p className="text-slate-400 text-sm">Access technical manuscript</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className={`w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 ${paper.color}`}>
                                <MainIcon className="w-10 h-10" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-2">{paper.title}</h3>
                            <p className="text-lg text-slate-400 mb-8 font-light">{paper.subtitle}</p>
                            
                            <a 
                                href={`https://doi.org/10.5281/zenodo.${paper.zenodoId}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className={`group inline-flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg active:scale-95`}
                            >
                                <Icons.ExternalLink className="w-5 h-5" />
                                Open in Zenodo
                            </a>
                        </div>
                    </div>
                );
            }

            return (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-24">
                    <div className={`bg-gradient-to-r ${paper.bgGradient} border-b border-slate-700 p-6 md:p-8 rounded-lg`}>
                        <div className={`flex items-center gap-2 mb-2 ${paper.color}`}>
                            <MainIcon className="w-5 h-5" />
                            <span className="font-mono text-sm font-bold tracking-wider uppercase">Technical Module</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{paper.title}</h2>
                        <p className="text-lg md:text-xl text-slate-300 font-light">{paper.subtitle}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-4">
                            {paper.zenodoId && (
                                <div className="group relative inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-600 text-xs font-mono text-slate-400">
                                    <span>ID: {paper.zenodoId}</span>
                                </div>
                            )}
                            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-black/30 border border-slate-600/50 text-xs text-slate-300">
                                <span className="flex items-center gap-1.5 font-bold">
                                    <Icons.Eye className="w-3 h-3 text-blue-400" /> 
                                    {s ? s.views : <span className="animate-pulse">...</span>}
                                </span>
                                <span className="w-px h-3 bg-slate-600"></span>
                                <span className="flex items-center gap-1.5 font-bold">
                                    <Icons.Download className="w-3 h-3 text-emerald-400" /> 
                                    {s ? s.downloads : <span className="animate-pulse">...</span>}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-slate-900/50 rounded border border-slate-700/50 backdrop-blur-sm">
                            <p className="text-slate-300 italic text-sm md:text-base">"{paper.summary}"</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {paper.sections.map((section: any, idx: number) => {
                            const SectionIcon = Icons[section.icon as keyof typeof Icons] || Icons.BookOpen;
                            const sectionId = `${activeTab}-${idx}`;
                            return (
                                <div key={idx} className="bg-slate-800 border border-slate-700 rounded-lg p-5 md:p-6 relative">
                                    {/* Mobile-Friendly Analyze Button */}
                                    <button 
                                        onClick={() => handleAnalyze(section.content, sectionId)}
                                        disabled={analyzingId === sectionId}
                                        className={`absolute top-4 right-4 text-xs px-3 py-1.5 rounded-full flex items-center gap-1 border transition-all shadow-sm ${
                                            analyzingId === sectionId 
                                            ? 'bg-blue-900/30 border-blue-500/50 text-blue-300' 
                                            : 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300 active:scale-95'
                                        }`}
                                    >
                                        {analyzingId === sectionId ? (
                                            <>
                                                <Icons.RefreshCw className="w-3 h-3 animate-spin" /> Processing
                                            </>
                                        ) : (
                                            <>
                                                <Icons.Bot className="w-3 h-3" /> Analyze
                                            </>
                                        )}
                                    </button>
                                    
                                    <div className="flex items-center gap-3 mb-4 pr-20">
                                        <div className={`p-2 rounded bg-slate-700 ${paper.color}`}>
                                            <SectionIcon className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold text-white leading-tight">{section.title}</h3>
                                    </div>
                                    <p className="text-slate-400 mb-4 leading-relaxed text-sm md:text-base">{section.content}</p>
                                    
                                    {section.code && (
                                        <div className="bg-slate-950 rounded border border-slate-800 p-4 mb-4 font-mono text-xs md:text-sm text-slate-300 overflow-x-auto shadow-inner">
                                            <span className={paper.color}>{section.code}</span>
                                        </div>
                                    )}

                                    {section.math && (
                                         <div className={`mb-4 font-mono text-xs ${paper.color} bg-slate-900 px-2 py-1 rounded inline-block`}>
                                            {section.math}
                                        </div>
                                    )}

                                    {section.details && (
                                        <div className="flex items-start gap-2 text-sm text-slate-500 bg-slate-900/30 p-3 rounded">
                                            <Icons.CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span>{section.details}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Mobile-Optimized Analysis Sheet/Card */}
                    {analysisResult && (
                        <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto md:w-96 bg-slate-900 border-t md:border border-purple-500/50 shadow-2xl rounded-t-xl md:rounded-lg animate-in slide-in-from-bottom z-50 flex flex-col max-h-[80vh]">
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 backdrop-blur-sm rounded-t-xl">
                                <h4 className="font-bold text-purple-400 flex items-center gap-2">
                                    <Icons.Bot className="w-4 h-4" /> KATIA Insight
                                </h4>
                                <button onClick={() => setAnalysisResult(null)} className="p-2 -mr-2 text-slate-400 hover:text-white">
                                    <span className="sr-only">Close</span>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto">
                                <div className="prose prose-invert prose-sm">
                                    <p className="text-slate-300 whitespace-pre-line leading-relaxed text-sm">{analysisResult}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Icons.BookOpen className="text-blue-500 w-5 h-5" />
                    INSTINCT <span className="text-slate-500 text-xs font-normal">v2.1</span>
                </h1>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 p-2">
                    {mobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                </button>
            </div>

            {/* Sidebar Navigation (Collapsible on Mobile) */}
            <div className={`
                fixed inset-0 z-30 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:w-64 md:bg-slate-900 md:border-r md:border-slate-800 md:flex md:flex-col md:h-screen
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="hidden md:block p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Icons.BookOpen className="text-blue-500" />
                        INSTINCT <span className="text-slate-500 text-sm font-normal">v2.1</span>
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto pt-20 md:pt-4">
                    <button
                        onClick={() => handleTabChange('landing')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'landing' 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <Icons.Home className="w-4 h-4" />
                        Start Here
                    </button>

                    <button
                        onClick={() => handleTabChange('synthesis')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                            activeTab === 'synthesis' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                            : tourStep === 3 
                                ? 'bg-slate-800/80 text-white ring-1 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <Icons.Layers className={`w-4 h-4 ${tourStep === 3 && activeTab !== 'synthesis' ? 'animate-pulse text-blue-400' : ''}`} />
                        System Synthesis
                        {tourStep === 3 && activeTab !== 'synthesis' && (
                             <span className="absolute right-3 w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                        )}
                    </button>

                    <button
                        onClick={() => handleTabChange('chat')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'chat' 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <Icons.Bot className="w-4 h-4" />
                        KATIA
                    </button>

                    <div className="pt-4 pb-2">
                        <span className="text-xs font-mono text-slate-600 px-4">CAPABILITIES</span>
                    </div>

                     <button
                        onClick={() => handleTabChange('research')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'research' 
                            ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                    >
                        <Icons.Globe className="w-4 h-4" />
                        Global Uplink
                    </button>

                    <div className="pt-4 pb-2">
                        <span className="text-xs font-mono text-slate-600 px-4">TECHNICAL MODULES</span>
                    </div>

                    {Object.values(PAPER_MODULES).map((paper: any) => {
                         const Icon = Icons[paper.icon as keyof typeof Icons] || Icons.BookOpen;
                         const isActive = activeTab === paper.id;
                         const isNextTourStep = 
                            (tourStep === 0 && paper.id === 'p2') ||
                            (tourStep === 1 && paper.id === 'p1') ||
                            (tourStep === 2 && paper.id === 'p3');

                         return (
                            <div key={paper.id} className="space-y-1">
                                <button
                                    onClick={() => handleTabChange(paper.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all relative overflow-hidden ${
                                        isActive
                                        ? `bg-slate-800 text-white border border-${paper.color.split('-')[1]}-500/50`
                                        : isNextTourStep 
                                            ? `bg-slate-800/80 text-white ring-1 ring-${paper.color.split('-')[1]}-500 shadow-[0_0_15px_rgba(255,255,255,0.1)]`
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? paper.color : isNextTourStep ? 'animate-pulse ' + paper.color : ''}`} />
                                    {paper.title}
                                    {isNextTourStep && (
                                         <span className="absolute right-3 w-2 h-2 rounded-full bg-current animate-ping opacity-75"></span>
                                    )}
                                </button>
                                {isActive && (
                                    <div className="pl-12 pr-4 space-y-1 animate-in slide-in-from-left-2 duration-200">
                                        <button 
                                            onClick={() => { setSubView('overview'); setMobileMenuOpen(false); }}
                                            className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors ${
                                                subView === 'overview' ? 'text-white bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            Overview
                                        </button>
                                        <button 
                                            onClick={() => { setSubView('paper'); setMobileMenuOpen(false); }}
                                            className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition-colors flex items-center justify-between ${
                                                subView === 'paper' ? 'text-white bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                        >
                                            <span>Read Paper</span>
                                            <Icons.ExternalLink className="w-3 h-3 opacity-50" />
                                        </button>
                                    </div>
                                )}
                            </div>
                         );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                            IH
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-300">Igor Holt</span>
                            <span className="text-[10px] text-slate-500">Lead Architect</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div ref={mainContentRef} className="flex-1 bg-slate-950 overflow-y-auto h-[calc(100vh-60px)] md:h-screen scroll-smooth relative">
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
                    {renderContent()}
                </div>

                {highlightPos && highlightText && (
                    <button
                        style={{
                            position: 'fixed',
                            top: `${highlightPos.top}px`,
                            left: `${highlightPos.left}px`,
                            transform: 'translate(-50%, 0)',
                        }}
                        onClick={handleExplainHighlight}
                        className="z-50 flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-full shadow-xl animate-in fade-in zoom-in duration-200 font-bold text-sm"
                    >
                        <Icons.Bot className="w-4 h-4" />
                        Explain
                    </button>
                )}
            </div>
            <Analytics />
        </div>
    );
}
