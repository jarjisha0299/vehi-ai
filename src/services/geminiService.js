import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export const sendMessage = async (message, history = []) => {
  try {
    if (!API_KEY) {
      throw new Error('API key missing');
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const chatHistory = history.slice(-5).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    return { success: true, text };
  } catch (error) {
    console.error('AI Error:', error);
    return { 
      success: false, 
      error: 'AI service unavailable. Check API key.'
    };
  }
};
