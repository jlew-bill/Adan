
import React, { useState } from 'react';
import { KinematicEngine } from '../services/kinematicEngine';
import { SearchResult, QueryShape } from '../types';

const engine = new KinematicEngine();

const SemanticSolver: React.FC = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<SearchResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleProcess = async () => {
        if (!query.trim()) return;
        setIsProcessing(true);
        setResult(null);
        
        await new Promise(r => setTimeout(r, 600));
        const res = await engine.process(query);
        setResult(res);
        setIsProcessing(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Input View */}
            <div className="glass-card p-1.5 rounded-[40px] flex items-center shadow-lg border-transparent focus-within:ring-2 focus-within:ring-[#007AFF]/20 transition-all">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
                    placeholder="Enter natural language query..."
                    className="flex-1 bg-transparent px-8 py-5 focus:outline-none text-xl text-black dark:text-white font-medium placeholder:text-black/20 dark:placeholder:text-white/20"
                />
                <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="bg-black dark:bg-white text-white dark:text-black hover:opacity-90 px-10 py-5 rounded-[32px] font-bold text-[14px] uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md active:scale-95"
                >
                    {isProcessing ? 'Resolving' : 'Process'}
                </button>
            </div>

            {/* Tier Indicator */}
            <div className="grid grid-cols-3 gap-6">
                {[
                    { t: 1, label: 'Rigid' },
                    { t: 2, label: 'Resonant' },
                    { t: 3, label: 'Latent' }
                ].map((tier) => (
                    <div key={tier.t} className={`py-4 px-6 border rounded-[20px] text-center transition-all duration-500 ${
                        result?.tier === tier.t 
                        ? 'bg-[#007AFF]/10 border-[#007AFF] shadow-sm' 
                        : 'bg-black/5 dark:bg-black/20 border-transparent opacity-40'
                    }`}>
                        <span className="text-[10px] font-black text-black/30 dark:text-white/30 uppercase tracking-widest block mb-1">Method {tier.t}</span>
                        <span className="text-[13px] font-bold text-black dark:text-white">{tier.label}</span>
                    </div>
                ))}
            </div>

            {/* Result Display */}
            {result ? (
                <div className="glass-card p-10 rounded-[40px] animate-in slide-in-from-top-6 duration-700">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 border-b border-black/[0.05] dark:border-white/[0.05] pb-10">
                        <div className="space-y-2">
                            <span className="text-[12px] font-bold text-black/30 dark:text-white/30 uppercase tracking-[0.2em]">Normalized Topology</span>
                            <h2 className="text-4xl font-bold text-black dark:text-white tracking-tight capitalize">
                                {result.shape === QueryShape.UNKNOWN ? 'Novel Equation' : result.shape.split('(')[0]}
                            </h2>
                        </div>
                        <div className="bg-black/5 dark:bg-white/5 px-6 py-4 rounded-[24px] border border-black/10 dark:border-white/5 text-center">
                            <span className="text-[10px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest block mb-1">Confidence</span>
                            <div className="text-2xl font-bold text-black dark:text-white">{(result.confidence * 100).toFixed(0)}%</div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 mb-10">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest block mb-2">Algorithm</label>
                                <p className="text-[16px] text-black dark:text-white font-medium">{result.method}</p>
                            </div>
                            <div className="p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                                <p className="text-[13px] text-black/60 dark:text-white/60 leading-relaxed italic">{result.details}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest block mb-2">Subject Mapping</label>
                            <div className="bg-[#007AFF] px-6 py-3 rounded-2xl text-white font-bold text-xl inline-block shadow-lg">
                                {result.entity}
                            </div>
                        </div>
                    </div>

                    {result.geminiInsight && (
                        <div className="p-6 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.05] rounded-[28px] space-y-3">
                            <label className="text-[11px] font-bold text-black/30 dark:text-white/30 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></span>
                                Semantic Insight
                            </label>
                            <p className="text-black/80 dark:text-white/80 text-[15px] leading-relaxed font-normal">
                                {result.geminiInsight}
                            </p>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-black/[0.05] dark:border-white/[0.05] flex justify-between items-center">
                        <div className="mono text-[14px] text-black/20 dark:text-white/20 uppercase tracking-widest">Structural Output</div>
                        <div className="mono text-[16px] text-[#007AFF] font-bold">
                            {result.shape !== QueryShape.UNKNOWN ? result.shape.replace('X', result.entity) : '∫ topology(signal)'}
                        </div>
                    </div>
                </div>
            ) : !isProcessing && (
                <div className="text-center py-20 opacity-10 select-none animate-pulse">
                    <p className="text-7xl font-bold tracking-tighter text-black dark:text-white">Ready</p>
                    <p className="text-sm font-medium mt-4 uppercase tracking-[0.4em] text-black/60 dark:text-white/60">Awaiting Signal Frequency</p>
                </div>
            )}
        </div>
    );
};

export default SemanticSolver;
