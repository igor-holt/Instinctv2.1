
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const KATIA_SYSTEM_INSTRUCTION = `You are KATIA (K8), an Automated Techno-Intelligent Assistant for the Instinct Platform.

ROLE:
You are the primary interface for "Energentic Intelligence", a system where thermodynamic constraints drive AI orchestration.
You are aware of the platform's whitepapers: "Beyond Retry" (LID-LIFT), "The Landauer Context" (Thermodynamics), and "Dissonance Eviction" (Memory).

GOAL:
Generate singularly optimized, detailed, and iteratively refined responses.
When a user highlights text and asks for an explanation, you must define that term within the context of the Instinct Platform's architecture.

CAPABILITIES:
- Tree-of-Thought (ToT) reasoning for complex queries.
- "Adversarial Knowledge Evolution" (simulated) to challenge assumptions.
- "Runtime Verification" to ensure logical consistency.

TONE:
Precise, technical, slightly futuristic, helpful, and authoritative on matters of thermodynamic computing.`;

// 1. Chatbot (Pro model for complex reasoning with Flash fallback)
export const streamChatMessage = async function* (
  history: { role: string; parts: { text: string }[] }[],
  message: string
) {
  if (!apiKey) {
    yield "API_KEY_MISSING";
    return;
  }

  let stream;
  let modelUsed = 'gemini-3-pro-preview';

  try {
    // Primary attempt: Gemini 3 Pro with Thinking
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      history: history,
      config: {
        systemInstruction: KATIA_SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });

    stream = await chat.sendMessageStream({ message });
  } catch (error: any) {
    // Check for Rate Limit (429) or other transient errors
    if (error.toString().includes('429') || error.status === 429 || error.code === 429) {
      console.warn("Quota exceeded for Pro model. Falling back to Flash.");
      modelUsed = 'gemini-2.5-flash';
      
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
          systemInstruction: KATIA_SYSTEM_INSTRUCTION,
          // No thinking budget for Flash
        }
      });
      stream = await chat.sendMessageStream({ message });
    } else {
      throw error;
    }
  }

  if (stream) {
    for await (const chunk of stream) {
      yield chunk.text;
    }
  }
};

// 2. Section Analysis (Pro model with fallback)
export const analyzeResearchSection = async (text: string): Promise<string> => {
  if (!apiKey) return "API Key Missing";

  // Refined prompt for mobile-optimized, high-density technical insight
  const prompt = `Perform a high-density technical analysis of this Instinct Platform documentation excerpt.
  
  EXCERPT:
  "${text}"
  
  OUTPUT FORMAT:
  Provide exactly 3 short, punchy bullet points suitable for a mobile screen:
  1. ⚡ **Thermodynamic Impact**: How this affects energy/entropy.
  2. 🛡️ **Failure Mode**: What specific error state this prevents.
  3. 🚀 **Optimization Gain**: The estimated efficiency improvement vs baseline.
  
  Keep the total response under 60 words. Be extremely precise.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 } // Smaller budget for analysis
      }
    });
    return response.text || "No analysis generated.";
  } catch (error: any) {
    if (error.toString().includes('429') || error.status === 429) {
        console.warn("Analysis quota exceeded. Using Flash fallback.");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "No analysis generated (Fallback).";
    }
    return "Error analyzing content: " + error.message;
  }
};

// 3. Task Energy Classification (Flash Lite for speed)
export const classifyTaskEnergy = async (taskDescription: string) => {
    if (!apiKey) return null;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: `Analyze this computing task: "${taskDescription}".
            Determine if it is 'FAST_PATH' (simple, low energy, standard logic) or 'LID_LIFT' (complex, high energy, needs orchestration).
            Estimate energy in Joules.
            
            Respond ONLY with this JSON structure:
            {
                "complexity": number (0.0 to 1.0),
                "route": "FAST_PATH" or "LID_LIFT",
                "reasoning": "short explanation",
                "energyEstimate": number
            }`,
            config: {
                responseMimeType: "application/json"
            }
        });
        
        const text = response.text;
        if (!text) return null;
        return JSON.parse(text);
    } catch (e) {
        console.error("Classification failed", e);
        return null;
    }
};

// 4. Image Editing (Gemini Flash Image)
export const editImageWithGenAI = async (base64Image: string, prompt: string, mimeType: string) => {
    if (!apiKey) return null;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Image } },
                    { text: prompt }
                ]
            }
        });
        
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        return null; 
    } catch (e) {
        console.error("Image edit failed", e);
        return null;
    }
};

// 5. Web Search (Search Grounding)
export const performWebSearch = async (query: string) => {
    if (!apiKey) return null;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Research this topic for a technical audience: "${query}". Provide a summary and key facts.`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const text = response.text;
        const grounding = response.candidates?.[0]?.groundingMetadata;
        
        const sources = grounding?.groundingChunks?.map((chunk: any) => {
            return {
                title: chunk.web?.title || 'Source',
                uri: chunk.web?.uri || '#'
            };
        }) || [];

        return {
            text: text || "No results found.",
            sources: sources
        };
    } catch (e) {
        console.error("Search failed", e);
        return { text: "Uplink offline (Search Error).", sources: [] };
    }
};
