
import { GoogleGenAI, Type } from "@google/genai";
import { 
    Scalar, Vector, CognitiveState, ConstraintStatus, Action, 
    SearchResult, PhysicalProperty, GroundingSource, ChatMessage
} from '../types';
import { WordMechanics } from './kinematicEngine';

const Vec = {
    add: (v1: Vector, v2: Vector): Vector => v1.map((val, i) => val + (v2[i] || 0)),
    scale: (v: Vector, s: Scalar): Vector => v.map(val => val * s),
    equals: (v1: Vector, v2: Vector, tolerance = 0.05): boolean => 
        v1.every((val, i) => Math.abs(val - (v2[i] || 0)) < tolerance),
};

export class BezierPrimitive {
    constructor(public P0: Vector, public P1: Vector, public P2: Vector, public P3: Vector) {}

    public evaluate(t: number): Vector {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;
        const term0 = Vec.scale(this.P0, mt3);
        const term1 = Vec.scale(this.P1, 3 * mt2 * t);
        const term2 = Vec.scale(this.P2, 3 * mt * t2);
        const term3 = Vec.scale(this.P3, t3);
        return Vec.add(Vec.add(term0, term1), Vec.add(term2, term3));
    }

    public checkClosure(): boolean {
        const finalPoint = this.evaluate(1.0);
        return Vec.equals(finalPoint, this.P3);
    }
}

export class AdaEngine {
    public async process(
        query: string, 
        history: ChatMessage[], 
        complexity: 'ELI5' | 'STANDARD' | 'TECHNICAL' = 'STANDARD'
    ): Promise<SearchResult> {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const now = new Date();
        const currentDateString = now.toLocaleString();
        
        // STEP 1: RESEARCH & GROUNDING (Always verify current state)
        const researchResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Research task for Ada Engine: 
            Query: "${query}". 
            Context: Current real-world date is ${currentDateString}. Operating in a simulated 2026 environment. 
            Identify current news, status of people, scientific facts, and political leaders. 
            If the user has a misconception (e.g. referencing an old leader), find the current 2026 equivalent or the fact that corrects it.`,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: "You are the grounding module. Fetch up-to-date data. If a user's premise is outdated or wrong, find the correct current data to bridge the gap."
            }
        });

        const researchSummary = researchResponse.text || "No direct research results. Relying on internal 2026-projection manifolds.";
        const groundingSources: GroundingSource[] = [];
        researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach((chunk: any) => {
            if (chunk.web) groundingSources.push({ uri: chunk.web.uri, title: chunk.web.title });
        });

        // STEP 2: EPISTEMIC GOVERNANCE & FLUID RESOLUTION
        const prompt = `
            TEMPORAL CONTEXT: ${currentDateString} (Simulated Year: 2026).
            COMPLEXITY LEVEL: ${complexity}.
            RESEARCH DATA: ${researchSummary}
            SESSION HISTORY: ${JSON.stringify(history)}
            
            USER INPUT: "${query}"
            
            GOVERNANCE PROTOCOL:
            1. Evaluate the input for "Signal Dissonance" (Misconceptions).
            2. If Misconception Probability is high, DO NOT stop or abstain. 
            3. BRIDGE THE GAP: Address the user's premise, explain the shift to the current 2026 reality, and solve the underlying semantic equation.
            4. If the user asks for synonyms or antonyms, or follows up on a previous point, use the SESSION HISTORY for context.
            5. For ELI5: Use simple, warm metaphors and clear language.
            6. For TECHNICAL: Use precise terminology and kinematic references.
            
            RESPONSE FORMAT (JSON):
            {
                "correctness": [0-1],
                "misconception": [0-1],
                "entity": "Primary entity being discussed",
                "equation": "e.g. capital(France) = Paris",
                "definition": "A concise kinematic definition of the primary entity.",
                "response": "Your full response here, addressing misconceptions and solving the query.",
                "synonyms": ["list", "of", "relevant", "synonyms"],
                "antonyms": ["list", "of", "relevant", "antonyms"],
                "action": "RESPOND"
            }
        `;

        const evaluationResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        correctness: { type: Type.NUMBER },
                        misconception: { type: Type.NUMBER },
                        entity: { type: Type.STRING },
                        equation: { type: Type.STRING },
                        definition: { type: Type.STRING },
                        response: { type: Type.STRING },
                        synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                        antonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                        action: { type: Type.STRING }
                    },
                    required: ["correctness", "misconception", "entity", "equation", "definition", "response", "synonyms", "antonyms", "action"]
                },
                systemInstruction: `You are Ada. You solve semantic equations. Never stop at an error; always resolve the signal into a truthful trajectory. Current Date Context: 2026.`
            }
        });

        const evalData = JSON.parse(evaluationResponse.text || "{}");
        const c = evalData.correctness;
        const m = evalData.misconception;
        const k = Math.max(c, m);
        const f = 1 - k;

        // NEWTON GOVERNANCE CALCULATIONS
        let state = CognitiveState.PARTIAL;
        if (m > c && m > 0.4) state = CognitiveState.MISCONCEPTION;
        else if (f > 0.5) state = CognitiveState.FOG;
        else if (c > 0.7) state = CognitiveState.CORRECT;

        const ground = Math.max(0.01, 1.0 - m);
        const ratio = c / ground;
        let status = ConstraintStatus.GREEN;
        if (ground <= 0.05) status = ConstraintStatus.FINFR;
        else if (ratio > 1.2) status = ConstraintStatus.RED;
        else if (ratio >= 0.8) status = ConstraintStatus.YELLOW;

        // KINEMATIC TRAJECTORY (Dynamic drag based on misconception)
        const mechanics = WordMechanics.analyze(evalData.entity || "Signal");
        const curvature = (mechanics.stats.flow + mechanics.stats.energy) / 10;
        const P0 = [0, 0];
        const P3 = [1, 1];
        // Misconception creates a "detour" in the trajectory
        const P1 = [0.1 + (m * 0.4), 0.5 + (m * 0.8)]; 
        const P2 = [0.9 - (m * 0.4), 0.5 - (m * 0.2)];
        const bezier = new BezierPrimitive(P0, P1, P2, P3);
        const trajectoryPoints: Vector[] = [];
        for (let i = 0; i <= 20; i++) trajectoryPoints.push(bezier.evaluate(i / 20));

        return {
            tier: 3,
            method: "Ada Fluid-Manifold Governance",
            shape: evalData.equation,
            entity: evalData.entity,
            confidence: c,
            details: `Epistemic Resolution: ${state}. Complexity: ${complexity}.`,
            geminiInsight: evalData.response,
            lexical: {
                synonyms: evalData.synonyms,
                antonyms: evalData.antonyms,
                equation: evalData.equation,
                definition: evalData.definition
            },
            csv: { c, m, f, k, state },
            constraint: { status, ratio },
            action: evalData.action as Action,
            trajectoryPoints,
            isClosed: bezier.checkClosure(),
            groundingSources: groundingSources.length > 0 ? groundingSources : undefined
        };
    }
}
