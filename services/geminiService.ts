import { GoogleGenAI } from "@google/genai";
import { AIActionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getSystemInstruction = (action: AIActionType): string => {
  switch (action) {
    case AIActionType.FIX_GRAMMAR:
      return "You are a professional editor. Correct the grammar and spelling of the user's text. Return ONLY the corrected text, do not add conversational filler.";
    case AIActionType.SUMMARIZE:
      return "You are a helpful assistant. Summarize the following text into a concise paragraph. Return ONLY the summary.";
    case AIActionType.CONTINUE_WRITING:
      return "You are a creative co-writer. Continue the following text naturally, maintaining the same tone and style. Keep the addition to roughly 3-4 sentences.";
    case AIActionType.MAKE_LONGER:
      return "You are a detailed writer. Expand upon the concepts in the text, adding more detail and depth. Return the expanded text.";
    default:
      return "You are a helpful assistant.";
  }
};

export const processTextWithAI = async (text: string, action: AIActionType): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const systemInstruction = getSystemInstruction(action);
    
    // We use gemini-2.5-flash for speed and efficiency on text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response generated from AI.");
    }
    
    return resultText.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process text with AI. Please try again.");
  }
};