
import React, { useState, useEffect } from 'react';
import GlyphLab from './components/GlyphLab';
import WordMechanic from './components/WordMechanic';
import SemanticSolver from './components/SemanticSolver';
import AdaConsole from './components/AdaConsole';
import { AIStudio } from './types';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ada' | 'glyphs' | 'mechanics' | 'semantics'>('ada');
    const [isKeyReady, setIsKeyReady] = useState<boolean | null>(null);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio) {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setIsKeyReady(hasKey);
            } else {
                // If not in an environment with aistudio, assume ready
                setIsKeyReady(true);
            }
        };
        checkKey();
    }, []);

    const handleUnlock = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            /**
             * Per instructions: A race condition can occur where hasSelectedApiKey() 
             * may not immediately return true after openSelectKey().
             * Assume success immediately to mitigate this.
             */
            setIsKeyReady(true);
        } else {
            setIsKeyReady(true);
        }
    };

    if (isKeyReady === null) return null; // Prevent flash of uninitialized state

    if (!isKeyReady) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#f5f5f7] dark:bg-black system-mesh">
                <div className="glass-card max-w-md w-full p-12 rounded-[48px] text-center space-y-10 animate-in zoom-in-95 duration-700 shadow-2xl border-white/20 dark:border-white/10">
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-[#007AFF] blur-2xl opacity-20 animate-pulse"></div>
                        <div className="relative w-full h-full bg-black dark:bg-white rounded-[28px] flex items-center justify-center text-white dark:text-black text-5xl font-black shadow-2xl">
                            A
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Kinematic Engine</h1>
                        <p className="text-[16px] text-black/50 dark:text-white/50 leading-relaxed font-medium">
                            The engine requires a secure manifold connection. Please select a paid API key to initialize the 2026 epistemic governance layer.
                        </p>
                    </div>

                    <button
                        onClick={handleUnlock}
                        className="w-full bg-[#007AFF] hover:bg-[#006EE6] text-white py-5 rounded-[24px] font-bold text-lg transition-all shadow-xl shadow-blue-500/20 active:scale-[0.97] hover:scale-[1.02]"
                    >
                        Unlock Manifold
                    </button>

                    <div className="pt-2">
                        <a 
                            href="https://ai.google.dev/gemini-api/docs/billing" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[12px] text-black/40 dark:text-white/40 hover:text-[#007AFF] transition-colors font-semibold underline underline-offset-4"
                        >
                            Review Billing Documentation
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="border-b border-black/[0.05] dark:border-white/[0.05] bg-white/70 dark:bg-black/40 backdrop-blur-2xl sticky top-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center font-black text-white dark:text-black shadow-lg transition-transform group-hover:scale-110">
                            A
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-black dark:text-white">
                                Ada Computing
                            </h1>
                            <p className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-widest">Manifold Resolution 2026</p>
                        </div>
                    </div>

                    <nav className="ios-segmented-control flex items-center p-1 bg-black/5 dark:bg-white/5 rounded-[12px]">
                        {(['ada', 'semantics', 'mechanics', 'glyphs'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 text-[13px] font-bold capitalize transition-all rounded-[9px] ${
                                    activeTab === tab 
                                    ? 'bg-white dark:bg-white/15 text-black dark:text-white shadow-sm' 
                                    : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
                                }`}
                            >
                                {tab === 'ada' ? 'Ada' : tab === 'semantics' ? 'Solver' : tab === 'mechanics' ? 'Engine' : 'Glyphs'}
                            </button>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto w-full py-10 px-6 flex-1">
                {activeTab === 'ada' && <AdaConsole onKeyReset={() => setIsKeyReady(false)} />}
                {activeTab === 'glyphs' && <GlyphLab />}
                {activeTab === 'mechanics' && <WordMechanic />}
                {activeTab === 'semantics' && <SemanticSolver />}
            </main>

            {/* Footer */}
            <footer className="border-t border-black/[0.05] dark:border-white/[0.05] bg-white/30 dark:bg-black/20 p-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[12px] text-black/40 dark:text-white/30 font-bold tracking-tight">
                    <p>© 2026 Ada Computing • Newtonian Framework</p>
                    <div className="flex gap-8 items-center">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></span>
                            System Live
                        </span>
                        <p className="uppercase tracking-widest">Encrypted Stream</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
