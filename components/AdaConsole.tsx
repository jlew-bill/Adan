
import React, { useState, useEffect, useRef } from 'react';
import { AdaEngine } from '../services/adaEngine';
import { SearchResult, ConstraintStatus, Action, CognitiveState, ChatMessage, LexicalNode } from '../types';

const engine = new AdaEngine();

interface DictionaryEntry {
    word: string;
    definition: string;
    synonyms: string[];
    antonyms: string[];
}

interface AdaConsoleProps {
    onKeyReset?: () => void;
}

const AdaConsole: React.FC<AdaConsoleProps> = ({ onKeyReset }) => {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<{ query: string, result: SearchResult }[]>([]);
    const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [complexity, setComplexity] = useState<'ELI5' | 'STANDARD' | 'TECHNICAL'>('STANDARD');
    const [lexicon, setLexicon] = useState<DictionaryEntry[]>([]);
    const [showLexicon, setShowLexicon] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    const scrollToNewest = () => {
        if (lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    useEffect(() => {
        const timeout = setTimeout(scrollToNewest, 150);
        return () => clearTimeout(timeout);
    }, [history.length, isThinking]);

    const handleSend = async (forcedInput?: string) => {
        const queryText = forcedInput || input;
        if (!queryText.trim() || isThinking) return;
        
        if (!forcedInput) setInput('');
        setIsThinking(true);
        
        try {
            const result = await engine.process(queryText, chatLog, complexity);
            setHistory(prev => [...prev, { query: queryText, result }]);
            setChatLog(prev => [
                ...prev, 
                { role: 'user', parts: [{ text: queryText }] },
                { role: 'model', parts: [{ text: result.geminiInsight }] }
            ]);

            if (result.lexical?.definition) {
                setLexicon(prev => {
                    const wordKey = result.entity.toLowerCase();
                    const exists = prev.find(e => e.word.toLowerCase() === wordKey);
                    if (exists) return prev;
                    return [{
                        word: result.entity,
                        definition: result.lexical!.definition!,
                        synonyms: result.lexical!.synonyms,
                        antonyms: result.lexical!.antonyms
                    }, ...prev];
                });
            }
        } catch (e: any) {
            console.error("Engine failure:", e);
            if (e.message && e.message.includes("Requested entity was not found")) {
                onKeyReset?.();
            }
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-240px)] gap-8 relative animate-in fade-in duration-1000">
            {/* Conversation Area */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {/* Status bar */}
                <div className="flex justify-between items-center px-1 shrink-0">
                    <div className="flex gap-1 ios-segmented-control p-1 bg-black/5 dark:bg-white/5 rounded-[12px]">
                        {(['ELI5', 'STANDARD', 'TECHNICAL'] as const).map(lvl => (
                            <button 
                                key={lvl}
                                onClick={() => setComplexity(lvl)}
                                className={`px-4 py-1.5 text-[11px] font-bold transition-all rounded-[8px] ${
                                    complexity === lvl 
                                    ? 'bg-white dark:bg-white/15 text-black dark:text-white shadow-sm' 
                                    : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/70'
                                }`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <span className="text-[11px] font-bold text-black/30 dark:text-white/30 tracking-widest uppercase">Signal: {currentTime}</span>
                        <button 
                            onClick={() => setShowLexicon(!showLexicon)}
                            className={`text-[11px] font-bold px-4 py-1.5 rounded-full transition-all border ${
                                showLexicon 
                                ? 'bg-black dark:bg-white border-transparent text-white dark:text-black' 
                                : 'bg-white/50 dark:bg-white/5 border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:border-black/20 dark:hover:border-white/20'
                            }`}
                        >
                            LEXICON ({lexicon.length})
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div ref={containerRef} className="flex-1 overflow-y-auto space-y-12 px-2 custom-scrollbar scroll-smooth">
                    {history.length === 0 && !isThinking && (
                        <div className="h-full flex flex-col items-center justify-center text-black/[0.03] dark:text-white/[0.03] pointer-events-none select-none">
                            <h2 className="text-[120px] font-black tracking-tighter leading-none">ADA</h2>
                            <p className="text-sm font-black mt-4 uppercase tracking-[0.4em] opacity-40">Ready for Signal Resolution</p>
                        </div>
                    )}

                    {history.map((item, idx) => {
                        const isLast = idx === history.length - 1;
                        return (
                            <div key={idx} ref={isLast ? lastMessageRef : null} className="space-y-8 pt-2">
                                {/* User Message */}
                                <div className="flex flex-col items-end animate-in slide-in-from-right-4 duration-300">
                                    <div className="bg-[#007AFF] px-6 py-4 rounded-[28px] rounded-tr-[4px] text-white text-[16px] font-semibold max-w-[80%] shadow-xl shadow-blue-500/10 border border-blue-400/20">
                                        {item.query}
                                    </div>
                                </div>

                                {/* Ada Message */}
                                <div className="flex flex-col items-start animate-in slide-in-from-left-4 duration-500">
                                    <div className="glass-card p-8 rounded-[32px] rounded-tl-[4px] max-w-[95%] space-y-8 border-black/5 dark:border-white/10 shadow-2xl">
                                        {/* Header Info */}
                                        <div className="flex justify-between items-center border-b border-black/[0.05] dark:border-white/[0.05] pb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                                    <span className="text-[10px] font-black text-[#007AFF]">Ω</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-black/30 dark:text-white/30 uppercase tracking-[0.2em]">Kinematic Topology</span>
                                                    <span className="text-[14px] font-bold text-black/90 dark:text-white/90 mono leading-none">{item.result.lexical?.equation}</span>
                                                </div>
                                            </div>
                                            <div className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                                                item.result.constraint?.status === ConstraintStatus.GREEN ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400'
                                            }`}>
                                                {item.result.constraint?.status}
                                            </div>
                                        </div>

                                        {/* Explanation */}
                                        <div className="text-[17px] text-black/80 dark:text-white/90 leading-[1.7] font-medium whitespace-pre-wrap">
                                            {item.result.geminiInsight}
                                        </div>

                                        {/* Lexical Details */}
                                        {item.result.lexical?.definition && (
                                            <div className="bg-black/5 dark:bg-black/20 p-6 rounded-[24px] border border-black/5 dark:border-white/5 space-y-5">
                                                <div>
                                                    <h5 className="text-[10px] font-black text-[#007AFF] uppercase tracking-[0.2em] mb-2">Lexical Definition</h5>
                                                    <p className="text-[15px] text-black/70 dark:text-white/70 leading-relaxed italic font-medium">"{item.result.lexical.definition}"</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {item.result.lexical.synonyms.map(s => (
                                                        <button 
                                                            key={s} 
                                                            onClick={() => handleSend(`Explore resonance of ${s}`)} 
                                                            className="text-[12px] font-bold px-4 py-1.5 bg-white dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5 hover:border-[#007AFF] hover:text-[#007AFF] transition-all text-black/60 dark:text-white/60 shadow-sm"
                                                        >
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Trajectory */}
                                        <div className="flex items-center gap-8 pt-6 border-t border-black/[0.05] dark:border-white/[0.05]">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between text-[10px] font-black uppercase text-black/30 dark:text-white/30 tracking-widest">
                                                    <span>Signal Confidence</span>
                                                    <span>{(item.result.confidence * 100).toFixed(0)}%</span>
                                                </div>
                                                <div className="h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                                                    <div style={{ width: `${(item.result.csv?.c || 0) * 100}%` }} className="bg-[#34C759] h-full shadow-[0_0_8px_rgba(52,199,89,0.4)]" />
                                                </div>
                                            </div>
                                            <div className="h-12 w-28 bg-white dark:bg-black/40 rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-sm">
                                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                    <path d={`M ${item.result.trajectoryPoints?.map(p => `${p[0]*100},${100 - p[1]*100}`).join(' L ')}`} fill="none" stroke="#007AFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isThinking && (
                        <div ref={lastMessageRef} className="flex items-start animate-pulse pt-2 pb-12">
                            <div className="glass-card px-8 py-5 rounded-[24px] rounded-tl-[4px] flex items-center gap-5 border-black/5 dark:border-white/10 shadow-lg">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                    <div className="w-2 h-2 bg-[#007AFF] rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                </div>
                                <span className="text-[14px] font-bold text-black/50 dark:text-white/50 uppercase tracking-[0.2em]">Resolving Manifold...</span>
                            </div>
                        </div>
                    )}
                    <div className="h-32 shrink-0" />
                </div>

                {/* Input Control - Minimalist, High-Contrast design */}
                <div className="mt-auto px-4 pb-4 shrink-0">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-[40px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <div className="relative bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-3xl flex items-center p-2.5 rounded-[40px] shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.4)] border-transparent ring-1 ring-black/5 dark:ring-white/10 focus-within:ring-2 focus-within:ring-[#007AFF]/30 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Query the kinematic engine..."
                                className="flex-1 bg-transparent px-8 py-4 focus:outline-none text-[17px] text-black dark:text-white font-medium placeholder:text-black/20 dark:placeholder:text-white/20"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isThinking || !input.trim()}
                                className="bg-[#007AFF] hover:bg-[#006EE6] disabled:bg-black/10 dark:disabled:bg-white/5 disabled:opacity-20 text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl shadow-blue-500/20 active:scale-90 hover:scale-105"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Lexicon */}
            {showLexicon && (
                <div className="w-full lg:w-96 glass-card rounded-[40px] flex flex-col animate-in slide-in-from-right-8 duration-700 overflow-hidden shadow-2xl border-black/5 dark:border-white/10">
                    <div className="p-7 border-b border-black/[0.05] dark:border-white/[0.05] bg-black/[0.02] dark:bg-black/40 flex justify-between items-center">
                        <div className="flex flex-col">
                            <h3 className="text-[12px] font-black tracking-[0.2em] uppercase text-black/40 dark:text-white/40">Resolved Lexicon</h3>
                            <span className="text-[10px] font-bold text-[#007AFF] uppercase">Static Cache active</span>
                        </div>
                        <button onClick={() => setShowLexicon(false)} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-7 space-y-8 custom-scrollbar">
                        {lexicon.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-20 select-none">
                                <div className="text-4xl mb-4">∅</div>
                                <p className="text-[11px] font-black uppercase tracking-widest">Awaiting Entity Resolution</p>
                            </div>
                        ) : lexicon.map((entry, eIdx) => (
                            <div key={eIdx} className="space-y-3 group">
                                <div className="flex justify-between items-end border-b border-black/[0.05] dark:border-white/[0.05] pb-2 transition-colors group-hover:border-[#007AFF]/30">
                                    <span className="text-[17px] font-bold text-black dark:text-white group-hover:text-[#007AFF] transition-colors">{entry.word}</span>
                                    <button onClick={() => handleSend(`Deconstruct ${entry.word}`)} className="text-[9px] font-black text-[#007AFF] opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest hover:underline">Deconstruct</button>
                                </div>
                                <p className="text-[14px] text-black/60 dark:text-white/50 leading-relaxed font-medium">{entry.definition}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdaConsole;
