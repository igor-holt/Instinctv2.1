import { TermDefinition } from './types';

export const TERMINOLOGY: TermDefinition[] = [
    {
        term: "Energentic Intelligence",
        definition: "A decision-making paradigm where energy availability and thermal constraints are primary survival inputs, not just optimization costs.",
        category: "Architecture"
    },
    {
        term: "Landauer Limit",
        definition: "The theoretical minimum amount of energy required to erase one bit of information (k_B T ln 2). Instinct uses this as the absolute baseline for efficiency benchmarking.",
        category: "Physics"
    },
    {
        term: "LID-LIFT",
        definition: "Layered Intelligence Decision - Lift Into Feasible Trajectories. An orchestration protocol that generates parallel plans when simple execution fails.",
        category: "Orchestration"
    },
    {
        term: "RAPL",
        definition: "Running Average Power Limit. A hardware interface on Intel/AMD CPUs that allows the software to monitor and control power consumption in real-time.",
        category: "Physics"
    },
    {
        term: "Dissonance Eviction",
        definition: "A memory management strategy that purges information contradicting the active plan, preventing 'agent schizophrenia' during complex tasks.",
        category: "Architecture"
    },
    {
        term: "η_thermo",
        definition: "The thermodynamic efficiency metric calculated as the ratio of Landauer limit energy to actual measured energy consumption.",
        category: "Physics"
    }
];

export const PAPER_MODULES = {
    p1: {
        id: 'p1',
        zenodoId: '17784144',
        title: "Beyond Retry",
        subtitle: "Metacognitive Dynamics Framework",
        icon: "Brain",
        color: "text-purple-400",
        bgGradient: "from-purple-900/20 to-transparent",
        summary: "A protocol to resolve 'cognitive deadlocks' where standard retries fail. It shifts reasoning to a higher plane of abstraction.",
        sections: [
            {
                title: "The 'Lid' Problem",
                icon: "AlertTriangle",
                content: "Standard agents get stuck when the intersection of Goal, Tools, and Context is empty. This is a semantic impasse, not a code error.",
                code: "S = G ∩ T ∩ C = ∅",
                details: "Traditional try/catch loops in this state lead to hallucination or repetitive failure."
            },
            {
                title: "The LID-LIFT Dynamic",
                icon: "RefreshCw",
                content: "A four-stage recovery process triggered by specific failure classes (spec_gap, context_overflow).",
                math: "T_active = T_std ∪ T_BBS",
                details: "Orchestrates recovery via Recast, Broaden, Diversity, and Rebuild phases to overcome the impasse."
            }
        ]
    },
    p2: {
        id: 'p2',
        zenodoId: '17784836',
        title: "The Landauer Context",
        subtitle: "Physics-Grounded Energy Basis",
        icon: "Zap",
        color: "text-amber-400",
        bgGradient: "from-amber-900/20 to-transparent",
        summary: "Normalizes AI energy use against the Landauer limit (kB T ln 2), treating thermodynamics as a design constraint.",
        sections: [
            {
                title: "The Efficiency Gap",
                icon: "Thermometer",
                content: "Current metrics (kWh, carbon) fluctuate too much. We need a ground truth physical lower bound.",
                code: "E_min = k_B T ln(2)",
                details: "This formula represents the minimum energy required to erase one bit of information."
            }
        ]
    },
    p3: {
        id: 'p3',
        zenodoId: '17784838',
        title: "Dissonance-Weighted Eviction",
        subtitle: "Hybrid LRU Protocol for Memory",
        icon: "Database",
        color: "text-emerald-400",
        bgGradient: "from-emerald-900/20 to-transparent",
        summary: "Solves 'Context Drift' by evicting memories that contradict the current active plan, regardless of how recent they are.",
        sections: [
            {
                title: "Context Hygiene",
                icon: "Trash2",
                content: "Standard LRU (Least Recently Used) assumes recent = relevant. It fails to catch 'Semantic Dissonance'.",
                details: "DWE proactively purges conflicting data to prevent 'agent schizophrenia'."
            }
        ]
    }
};