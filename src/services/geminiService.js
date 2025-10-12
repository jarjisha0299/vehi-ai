import { GoogleGenerativeAI } from '@google/generative-ai';

export const sendMessage = async (message) => {
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API key is missing from environment');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(message);
    const text = result.response.text();

    return { success: true, text };

  } catch (error) {
    let errorMsg = 'Something went wrong';
    
    if (error.message.includes('API key')) {
      errorMsg = 'Invalid API key - please create a new one';
    } else if (error.message.includes('quota')) {
      errorMsg = 'API quota exceeded - wait 1 minute';
    } else if (error.message.includes('model')) {
      errorMsg = 'Model error - trying different model...';
    }
    
    return { 
      success: false, 
      error: errorMsg
    };
  }
};
