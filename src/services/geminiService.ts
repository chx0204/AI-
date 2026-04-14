import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Script {
  title: string;
  genre: string;
  logline: string;
  scenes: {
    location: string;
    time: string;
    action: string;
    dialogue?: {
      character: string;
      text: string;
    }[];
  }[];
  twist: string;
}

export async function generateScript(theme: string, style: string, duration: string = "1 minute"): Promise<Script> {
  const prompt = `Generate a high-quality ${duration} short film script.
  Theme: ${theme}
  Style/Genre: ${style}
  
  Requirements:
  1. Oscar-worthy quality (compelling imagery, tight dialogue).
  2. Must have a significant and unexpected twist at the end.
  3. Approximately ${duration} of screen time.
  4. Format as JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          genre: { type: Type.STRING },
          logline: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                location: { type: Type.STRING },
                time: { type: Type.STRING },
                action: { type: Type.STRING },
                dialogue: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      character: { type: Type.STRING },
                      text: { type: Type.STRING }
                    }
                  }
                }
              },
              required: ["location", "time", "action"]
            }
          },
          twist: { type: Type.STRING }
        },
        required: ["title", "genre", "logline", "scenes", "twist"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
