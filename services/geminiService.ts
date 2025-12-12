import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ModelType } from '../types';

let chatSession: Chat | null = null;
let currentModel: string | null = null;

export const getAIInstance = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const createChatSession = (model: ModelType) => {
  const ai = getAIInstance();
  
  // Logic to determine config based on model
  let config: any = {
    systemInstruction: "You are a highly capable, helpful, and friendly AI assistant named NovaChat. You provide clear, concise, and accurate answers. When writing code, you provide explanations.",
  };

  // Enable thinking for Pro model if desired (simulating DeepSeek reasoning capabilities)
  if (model === ModelType.PRO) {
     config = {
         ...config,
         // Thinking budget allows for more complex reasoning chains
         thinkingConfig: { thinkingBudget: 2048 }, 
     };
  }

  currentModel = model;
  chatSession = ai.chats.create({
    model: model,
    config: config
  });
  return chatSession;
};

export const sendMessageStream = async function* (message: string, model: ModelType) {
  // Re-initialize session if model changed or session doesn't exist
  if (!chatSession || currentModel !== model) {
    createChatSession(model);
  }

  if (!chatSession) throw new Error("Failed to initialize chat session");

  try {
    const result = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Error in stream:", error);
    throw error;
  }
};