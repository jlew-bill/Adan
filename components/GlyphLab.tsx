
import React, { useState } from 'react';
import { GLYPH_DB } from '../constants';
import { Glyph } from '../types';

const GlyphLab: React.FC = () => {
    const [selectedGlyph, setSelectedGlyph] = useState<Glyph>(GLYPH_DB['A']);

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 animate-in fade-in duration-700">
            {/* Grid of Glyphs */}
            <div className="lg:w-2/3 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
                {Object.values(GLYPH_DB).map((glyph) => (
                    <button
                        key={glyph.char}
                        onClick={() => setSelectedGlyph(glyph)}
                        className={`aspect-square flex items-center justify-center text-3xl mono transition-all border rounded-2xl ${
                            selectedGlyph.char === glyph.char 
                            ? 'bg-[#007AFF]/10 border-[#007AFF] text-[#007AFF] shadow-lg' 
                            : 'bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                    >
                        {glyph.char}
                    </button>
                ))}
            </div>

            {/* Glyph Details */}
            <div className="lg:w-1/3 glass-card p-8 rounded-[32px]">
                <div className="flex items-center gap-6 mb-8">
                    <span className="text-7xl font-black mono text-[#007AFF]">
                        {selectedGlyph.char}
                    </span>
                    <div>
                        <h3 className="text-xl font-bold uppercase tracking-widest text-black dark:text-white">{selectedGlyph.role}</h3>
                        <p className="text-[#007AFF] mono text-sm font-semibold">{selectedGlyph.physics}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] uppercase text-black/40 dark:text-white/40 font-bold tracking-[0.2em] block mb-2">Vector Dynamics</label>
                        <p className="text-black/70 dark:text-white/70 italic text-base leading-relaxed">
                            "{selectedGlyph.vector}"
                        </p>
                    </div>

                    <div className="pt-6 border-t border-black/[0.05] dark:border-white/[0.05]">
                        <label className="text-[10px] uppercase text-black/40 dark:text-white/40 font-bold tracking-[0.2em] block mb-3">Mechanical Schema</label>
                        <div className="bg-black/5 dark:bg-black/40 p-5 border border-black/5 dark:border-white/5 rounded-2xl font-mono text-[11px] text-[#007AFF]/80 leading-tight">
                            {`// PHYSICS DEFINITION\nENTITY Glyph_${selectedGlyph.char} {\n  ROLE: "${selectedGlyph.role}";\n  PROPERTIES: [${selectedGlyph.physics}];\n  CONSTRAINTS: STATIC;\n}`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlyphLab;
