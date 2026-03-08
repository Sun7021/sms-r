
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
  try {
    const { provider, client } = getAIClient('IMAGE');
    const itemDesc = description || "Delicious traditional cuisine";
    const prompt = `A professional high-quality studio food photograph of ${itemName}. ${itemDesc}. Cinematic lighting, white background, 4k resolution.`;

    if (provider === 'OPENAI') {
      const response = await client.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      if (response.data && response.data[0] && response.data[0].url) {
        return response.data[0].url;
      }
      throw new Error("OpenAI returned an empty response");
    } else {
      // Using gemini-3.1-flash-image-preview for better availability and quality
      const response = await client.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: { 
          imageConfig: { 
            aspectRatio: "1:1",
            imageSize: "1K" 
          } 
        }
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("Gemini returned no candidates. This might be due to safety filters, region restrictions, or billing status.");
      }

      const candidate = response.candidates[0];
      if (candidate.finishReason && candidate.finishReason !== 'STOP') {
        throw new Error(`Gemini failed with reason: ${candidate.finishReason}. Check if the prompt violates safety policies.`);
      }

      for (const part of candidate.content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in the AI response. Ensure your API key has permissions for image generation.");
  } catch (error: any) {
    console.error("AI Generation Error Details:", error);
    
    let message = error.message || "Unknown AI error";
    
    // Try to parse JSON error messages often returned by Google/OpenAI SDKs
    try {
      if (typeof message === 'string' && (message.startsWith('{') || message.includes('{"error"'))) {
        const jsonStart = message.indexOf('{');
        const parsed = JSON.parse(message.substring(jsonStart));
        if (parsed.error && parsed.error.message) {
          message = parsed.error.message;
        }
      }
    } catch (e) {
      // Not JSON, keep original message
    }

    // Handle OpenAI specific error formats
    if (error.error && error.error.message) {
      message = error.error.message;
    } else if (error.response && error.response.data && error.response.data.error) {
      message = error.response.data.error.message;
    }

    // User-friendly translation for common errors
    if (message.includes("quota") || message.includes("RESOURCE_EXHAUSTED") || message.includes("limit")) {
      message = "AI Quota Exceeded: Your API key has reached its billing limit or free tier quota. Please check your billing settings at ai.google.dev or platform.openai.com.";
    }
    
    throw new Error(message);
  }
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
