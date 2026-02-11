
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
                        className={`aspect-square flex items-center justify-center text-3xl mono transition-all border ${
                            selectedGlyph.char === glyph.char 
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-600'
                        }`}
                    >
                        {glyph.char}
                    </button>
                ))}
            </div>

            {/* Glyph Details */}
            <div className="lg:w-1/3 glass-panel p-6 border-l-4 border-l-cyan-500 rounded-r-lg">
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-7xl font-black mono text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                        {selectedGlyph.char}
                    </span>
                    <div>
                        <h3 className="text-xl font-bold uppercase tracking-widest">{selectedGlyph.role}</h3>
                        <p className="text-cyan-500 mono text-sm">{selectedGlyph.physics}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase text-slate-500 tracking-[0.2em] block mb-1">Vector Dynamics</label>
                        <p className="text-slate-300 italic text-sm leading-relaxed">
                            "{selectedGlyph.vector}"
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                        <label className="text-[10px] uppercase text-slate-500 tracking-[0.2em] block mb-2">Mechanical Schema</label>
                        <div className="bg-slate-950 p-4 border border-slate-900 rounded font-mono text-[11px] text-cyan-600/60 leading-tight">
                            {`// PHYSICS DEFINITION\nENTITY Glyph_${selectedGlyph.char} {\n  ROLE: "${selectedGlyph.role}";\n  PROPERTIES: [${selectedGlyph.physics}];\n  CONSTRAINTS: STATIC;\n}`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlyphLab;
