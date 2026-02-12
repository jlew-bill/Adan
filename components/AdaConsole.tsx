
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

const AdaConsole: React.FC = () => {
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
        } catch (e) {
            console.error("Engine failure:", e);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-220px)] gap-6 relative animate-in fade-in duration-1000">
            {/* Conversation Area */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Status bar */}
                <div className="flex justify-between items-center px-2 shrink-0">
                    <div className="flex gap-1.5 ios-segmented-control">
                        {(['ELI5', 'STANDARD', 'TECHNICAL'] as const).map(lvl => (
                            <button 
                                key={lvl}
                                onClick={() => setComplexity(lvl)}
                                className={`px-4 py-1 text-[11px] font-semibold transition-all rounded-[7px] ${
                                    complexity === lvl ? 'ios-tab-active text-black dark:text-white' : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/70'
                                }`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="text-[11px] font-medium text-black/30 dark:text-white/30 tracking-tight">Clock: {currentTime}</span>
                        <button 
                            onClick={() => setShowLexicon(!showLexicon)}
                            className={`text-[11px] font-semibold px-4 py-1 rounded-full transition-all border ${
                                showLexicon ? 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/20 text-black dark:text-white' : 'border-black/5 dark:border-white/5 text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60'
                            }`}
                        >
                            Lexicon ({lexicon.length})
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div ref={containerRef} className="flex-1 overflow-y-auto space-y-12 px-2 custom-scrollbar scroll-smooth">
                    {history.length === 0 && !isThinking && (
                        <div className="h-full flex flex-col items-center justify-center text-black/10 dark:text-white/10 pointer-events-none select-none">
                            <h2 className="text-7xl font-bold tracking-tighter opacity-10">Ada</h2>
                            <p className="text-sm font-medium tracking-tight mt-4 uppercase">Ready for Signal</p>
                        </div>
                    )}

                    {history.map((item, idx) => {
                        const isLast = idx === history.length - 1;
                        return (
                            <div key={idx} ref={isLast ? lastMessageRef : null} className="space-y-6 pt-2">
                                {/* User Message */}
                                <div className="flex flex-col items-end animate-in slide-in-from-right-2 duration-300">
                                    <div className="bg-[#007AFF] px-5 py-3 rounded-[20px] rounded-tr-[4px] text-white text-[15px] font-medium max-w-[85%] shadow-md">
                                        {item.query}
                                    </div>
                                </div>

                                {/* Ada Message */}
                                <div className="flex flex-col items-start animate-in slide-in-from-left-2 duration-500">
                                    <div className="glass-card p-6 rounded-[24px] rounded-tl-[4px] max-w-[95%] space-y-6">
                                        {/* Header Info */}
                                        <div className="flex justify-between items-center border-b border-black/[0.05] dark:border-white/[0.05] pb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">Topology</span>
                                                <span className="text-[14px] font-semibold text-black/90 dark:text-white/90 mono">{item.result.lexical?.equation}</span>
                                            </div>
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                item.result.constraint?.status === ConstraintStatus.GREEN ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
                                            }`}>
                                                {item.result.constraint?.status}
                                            </div>
                                        </div>

                                        {/* Explanation */}
                                        <div className="text-[16px] text-black/80 dark:text-white/90 leading-[1.6] font-normal whitespace-pre-wrap">
                                            {item.result.geminiInsight}
                                        </div>

                                        {/* Lexical Details */}
                                        {item.result.lexical?.definition && (
                                            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-[18px] border border-black/5 dark:border-white/5 space-y-4">
                                                <div>
                                                    <h5 className="text-[11px] font-bold text-black/30 dark:text-white/30 uppercase tracking-tight mb-1">Definition: {item.result.entity}</h5>
                                                    <p className="text-[14px] text-black/60 dark:text-white/60 leading-relaxed italic">{item.result.lexical.definition}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.result.lexical.synonyms.map(s => (
                                                        <button key={s} onClick={() => handleSend(`Tell me more about ${s}`)} className="text-[12px] font-medium px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-black/70 dark:text-white/70">
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Trajectory */}
                                        <div className="flex items-center gap-6 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
                                            <div className="flex-1 h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                                <div style={{ width: `${(item.result.csv?.c || 0) * 100}%` }} className="bg-[#34C759] h-full" />
                                            </div>
                                            <div className="h-10 w-24 bg-black/5 dark:bg-black/40 rounded-xl border border-black/10 dark:border-white/5 overflow-hidden">
                                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                    <path d={`M ${item.result.trajectoryPoints?.map(p => `${p[0]*100},${100 - p[1]*100}`).join(' L ')}`} fill="none" stroke="#007AFF" strokeWidth="3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {isThinking && (
                        <div ref={lastMessageRef} className="flex items-start animate-pulse pt-2 pb-8">
                            <div className="glass-card px-6 py-4 rounded-[20px] rounded-tl-[4px] flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-black/20 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-black/20 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                    <div className="w-1.5 h-1.5 bg-black/20 dark:bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                </div>
                                <span className="text-[13px] font-medium text-black/40 dark:text-white/40">Ada is processing...</span>
                            </div>
                        </div>
                    )}
                    <div className="h-24 shrink-0" />
                </div>

                {/* Input Control */}
                <div className="mt-auto px-2 pb-2 shrink-0">
                    <div className="glass-card flex items-center p-2 rounded-[30px] shadow-lg border-transparent focus-within:ring-2 focus-within:ring-[#007AFF]/20 transition-all">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent px-6 py-3 focus:outline-none text-[16px] text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isThinking || !input.trim()}
                            className="bg-[#007AFF] hover:bg-[#006EE6] disabled:bg-black/10 dark:disabled:bg-white/5 disabled:opacity-20 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar Lexicon */}
            {showLexicon && (
                <div className="w-full lg:w-80 glass-card rounded-[24px] flex flex-col animate-in slide-in-from-right-4 duration-500 overflow-hidden">
                    <div className="p-5 border-b border-black/[0.05] dark:border-white/[0.05] bg-black/[0.02] flex justify-between items-center">
                        <h3 className="text-sm font-bold tracking-tight uppercase text-black/40 dark:text-white/40">Lexicon</h3>
                        <button onClick={() => setShowLexicon(false)} className="text-black/20 dark:text-white/20 hover:text-black/60 dark:hover:text-white/60 text-lg">✕</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                        {lexicon.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-10">
                                <p className="text-sm font-medium text-black dark:text-white">No terms resolved.</p>
                            </div>
                        ) : lexicon.map((entry, eIdx) => (
                            <div key={eIdx} className="space-y-2 group">
                                <div className="flex justify-between items-center border-b border-black/[0.05] dark:border-white/[0.05] pb-2">
                                    <span className="text-[15px] font-bold text-black/90 dark:text-white/90">{entry.word}</span>
                                    <button onClick={() => handleSend(`Define ${entry.word}`)} className="text-[10px] font-bold text-[#007AFF] opacity-0 group-hover:opacity-100 transition-opacity uppercase">Define</button>
                                </div>
                                <p className="text-[13px] text-black/50 dark:text-white/50 leading-relaxed font-normal">{entry.definition}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdaConsole;
