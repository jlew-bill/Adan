
import React, { useState, useMemo } from 'react';
import { WordMechanics } from '../services/kinematicEngine';
import { 
    Radar, RadarChart, PolarGrid, 
    PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

const WordMechanic: React.FC = () => {
    const [word, setWord] = useState('ENGINE');
    
    const analysis = useMemo(() => {
        return WordMechanics.analyze(word || 'A');
    }, [word]);

    const chartData = useMemo(() => [
        { subject: 'Stability', A: analysis.stats.stability, fullMark: 5 },
        { subject: 'Containment', A: analysis.stats.containment, fullMark: 5 },
        { subject: 'Energy', A: analysis.stats.energy, fullMark: 5 },
        { subject: 'Flow', A: analysis.stats.flow, fullMark: 5 },
        { subject: 'Stop', A: analysis.stats.stop, fullMark: 5 },
        { subject: 'Alignment', A: analysis.stats.alignment, fullMark: 5 },
    ], [analysis]);

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-4">
                    <label className="text-[11px] font-bold text-black/30 dark:text-white/30 uppercase tracking-[0.2em]">Kinematic Assembly Input</label>
                </div>
                <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value.toUpperCase().slice(0, 15))}
                    placeholder="ENTER WORD..."
                    className="w-full bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10 px-8 py-6 text-center text-5xl font-bold tracking-tight text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]/20 placeholder:text-black/5 transition-all"
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                {/* Assembly Path */}
                <div className="glass-card p-10 rounded-[40px] flex flex-col justify-between space-y-12">
                    <div className="space-y-6">
                        <h3 className="text-[12px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">Assembly Schema</h3>
                        <div className="flex flex-wrap items-center gap-4">
                            {analysis.glyphs.map((g, i) => (
                                <React.Fragment key={i}>
                                    <div className="flex flex-col items-center group">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl border border-black/10 dark:border-white/10 text-black dark:text-white font-bold mono bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-all shadow-sm">
                                            {g.char}
                                        </div>
                                        <div className="text-[9px] font-semibold text-black/30 dark:text-white/30 mt-2 uppercase tracking-tight">
                                            {g.role.split(' ')[0]}
                                        </div>
                                    </div>
                                    {i < analysis.glyphs.length - 1 && (
                                        <div className="text-black/10 dark:text-white/10 text-xl font-thin px-1">→</div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 pt-8 border-t border-black/[0.05] dark:border-white/[0.05]">
                        <h3 className="text-[12px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">Archetype Classification</h3>
                        <div className="text-3xl font-bold text-[#007AFF] tracking-tight py-2 inline-block">
                            {analysis.profile}
                        </div>
                        <p className="text-sm text-black/40 dark:text-white/40 leading-relaxed max-w-sm">
                            Calculated through glyph vector aggregation and load distribution analysis.
                        </p>
                    </div>
                </div>

                {/* Data Profile */}
                <div className="glass-card p-10 rounded-[40px] h-[500px] relative overflow-hidden">
                    <h3 className="text-[12px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest absolute top-10 left-10">Mechanical Profile</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600, opacity: 0.5 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 'auto']} axisLine={false} tick={false} />
                            <Radar
                                name="Profile"
                                dataKey="A"
                                stroke="#007AFF"
                                strokeWidth={3}
                                fill="#007AFF"
                                fillOpacity={0.2}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default WordMechanic;
