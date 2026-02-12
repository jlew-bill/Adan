
import React, { useState } from 'react';
import GlyphLab from './components/GlyphLab';
import WordMechanic from './components/WordMechanic';
import SemanticSolver from './components/SemanticSolver';
import AdaConsole from './components/AdaConsole';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ada' | 'glyphs' | 'mechanics' | 'semantics'>('ada');

    return (
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="border-b border-black/[0.05] dark:border-white/[0.05] bg-white/60 dark:bg-black/40 backdrop-blur-xl sticky top-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center font-bold text-black dark:text-white border border-black/10 dark:border-white/10 shadow-sm">
                            A
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight text-black dark:text-white">
                                Ada Computing
                            </h1>
                            <p className="text-[11px] text-black/40 dark:text-white/40 font-medium uppercase tracking-wider">Newtonian Epistemic Governance</p>
                        </div>
                    </div>

                    <nav className="ios-segmented-control flex items-center">
                        {(['ada', 'semantics', 'mechanics', 'glyphs'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-1.5 text-[13px] font-medium capitalize transition-all rounded-[7px] ${
                                    activeTab === tab 
                                    ? 'ios-tab-active text-black dark:text-white' 
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
            <main className="max-w-7xl mx-auto w-full py-8 px-6 flex-1">
                {activeTab === 'ada' && <AdaConsole />}
                {activeTab === 'glyphs' && <GlyphLab />}
                {activeTab === 'mechanics' && <WordMechanic />}
                {activeTab === 'semantics' && <SemanticSolver />}
            </main>

            {/* Footer */}
            <footer className="border-t border-black/[0.05] dark:border-white/[0.05] bg-black/[0.02] dark:bg-black/20 p-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[12px] text-black/30 dark:text-white/30 font-medium tracking-tight">
                    <p>© 2026 Ada Computing • Newtonian Framework</p>
                    <div className="flex gap-6 items-center">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                            Governance Active
                        </span>
                        <p>Ledger Synchronized</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default App;
