import { GoogleGenAI, Type } from "@google/genai";
import { TriviaQuestion } from "../types";

const apiKey = process.env.API_KEY || "";
// Initialize safely; if key is missing, we will handle errors in the call
const ai = new GoogleGenAI({ apiKey });

export const generateTriviaQuestion = async (): Promise<TriviaQuestion> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a fun, random trivia question suitable for a student. It should be general knowledge, science, or pop culture.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctIndex: { type: Type.INTEGER },
          },
          required: ["question", "options", "correctIndex"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        ...data,
        reward: 50, // Fixed reward for AI quiz
      };
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback question if API fails or key is missing
    return {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Jupiter", "Venus"],
      correctIndex: 1,
      reward: 10,
    };
  }
};
