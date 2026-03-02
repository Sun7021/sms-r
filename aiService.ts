
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";

const getActiveKeyRecord = (task: 'AI' | 'IMAGE') => {
  try {
    const keysRaw = localStorage.getItem('gemini_api_keys');
    if (keysRaw) {
      const keys = JSON.parse(keysRaw);
      // Look for a key specifically designated for this task
      const designated = keys.find((k: any) => k.isActive && k.type === task);
      if (designated && designated.key) return designated;
      
      // Fallback: Use any active key if no specific type is found
      const active = keys.find((k: any) => k.isActive);
      if (active && active.key) return active;
    }
  } catch (e) {
    console.error("Error reading keys from storage", e);
  }
  return null;
};

const getAIClient = (task: 'AI' | 'IMAGE' = 'AI') => {
  const record = getActiveKeyRecord(task);
  
  if (record) {
    if (record.provider === 'OPENAI') {
      return { 
        provider: 'OPENAI' as const, 
        client: new OpenAI({ apiKey: record.key, dangerouslyAllowBrowser: true }) 
      };
    }
    return { 
      provider: 'GEMINI' as const, 
      client: new GoogleGenAI({ apiKey: record.key }) 
    };
  }

  const fallbackKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (fallbackKey) {
    return { 
      provider: 'GEMINI' as const, 
      client: new GoogleGenAI({ apiKey: fallbackKey }) 
    };
  }

  throw new Error(`No AI API Key configured for ${task}. Please add one in Settings.`);
};

export const getSalesPrediction = async (history: any[]) => {
  const { provider, client } = getAIClient('AI');
  const prompt = `Based on this historical sales data: ${JSON.stringify(history)}. 
  Predict next week's sales, identify peak hours, and suggest high-demand dishes. 
  Provide the output in JSON format.`;

  if (provider === 'OPENAI') {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content || '{}');
  } else {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING },
            peakHours: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedDishes: { type: Type.ARRAY, items: { type: Type.STRING } },
            growthForecast: { type: Type.NUMBER }
          },
          required: ["prediction", "peakHours", "suggestedDishes"]
        }
      }
    });
    return JSON.parse(response.text);
  }
};

export const generateFoodImage = async (itemName: string, description: string) => {
  const { provider, client } = getAIClient('IMAGE');
  const prompt = `A professional high-quality studio food photograph of ${itemName}. ${description}. Cinematic lighting, white background, 4k resolution.`;

  if (provider === 'OPENAI') {
    const response = await client.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    return response.data[0].url;
  } else {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image");
};

export const parseVoiceCommand = async (command: string, menuItems: string[]) => {
  const { provider, client } = getAIClient('AI');
  const prompt = `Translate this voice command into structured JSON: "${command}".
  Available menu items: ${menuItems.join(', ')}.
  Advanced Instructions: 
  - Handle quantities (e.g., "three burgers").
  - Handle modifiers/notes (e.g., "extra spicy", "no onions").
  - Handle promo codes (e.g., "Apply code WELCOME10").
  - Actions: ADD_ITEM, APPLY_PROMO, GENERATE_BILL, CANCEL_ORDER.
  
  Example: "Add 2 paneer tikka extra spicy and apply code SAVE10" -> 
  { "action": "ADD_ITEM", "items": [{ "name": "Paneer Tikka", "qty": 2, "notes": "extra spicy" }], "promo": "SAVE10" }`;

  if (provider === 'OPENAI') {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
    return JSON.parse(response.choices[0].message.content || '{}');
  } else {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  qty: { type: Type.NUMBER },
                  notes: { type: Type.STRING }
                }
              }
            },
            promo: { type: Type.STRING },
            table: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  }
};
