import { supabase } from '../utils/supabaseClient';

/**
 * Chat History Service
 * Manages saving, loading, and deleting chat conversations in Supabase
 */

/**
 * Save chat history to database
 * @param {string} userId - User's unique ID
 * @param {Array} messages - Array of message objects
 * @returns {Promise<Object>} - Result object with success status
 */
export const saveChatHistory = async (userId, messages) => {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages array');
    }

    // Remove sensitive data and keep only necessary fields
    const sanitizedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));

    // Insert into database
    const { data, error } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id: userId,
          messages: JSON.stringify(sanitizedMessages),
          message_count: sanitizedMessages.length,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('❌ Save chat error:', error);
      throw error;
    }

    return { success: true, data };

  } catch (error) {
    console.error('❌ Save chat history failed:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to save chat' 
    };
  }
};

/**
 * Get chat history from database
 * @param {string} userId - User's unique ID
 * @param {number} limit - Maximum number of chats to retrieve
 * @returns {Promise<Object>} - Result object with chat history data
 */
export const getChatHistory = async (userId, limit = 20) => {
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Get chat error:', error);
      throw error;
    }

    return { success: true, data: data || [] };

  } catch (error) {
    console.error('❌ Get chat history failed:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to load chat history',
      data: []
    };
  }
};

/**
 * Delete a specific chat by ID
 * @param {string} chatId - Chat's unique ID
 * @returns {Promise<Object>} - Result object with success status
 */
export const deleteSingleChat = async (chatId) => {
  try {
    if (!chatId) {
      throw new Error('Invalid chat ID');
    }

    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('❌ Delete chat error:', error);
      throw error;
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Delete single chat failed:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to delete chat'
    };
  }
};

/**
 * Delete all chat history for a user
 * @param {string} userId - User's unique ID
 * @returns {Promise<Object>} - Result object with success status
 */
export const deleteChatHistory = async (userId) => {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid user ID');
    }

    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Delete all chats error:', error);
      throw error;
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Delete chat history failed:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to delete chat history'
    };
  }
};

/**
 * Get chat statistics for a user
 * @param {string} userId - User's unique ID
 * @returns {Promise<Object>} - Statistics object
 */
export const getChatStats = async (userId) => {
  try {
    if (!userId) {
      throw new Error('Invalid user ID');
    }

    const { data, error } = await supabase
      .from('chat_history')
      .select('message_count, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    const totalChats = data?.length || 0;
    const totalMessages = data?.reduce((sum, chat) => sum + (chat.message_count || 0), 0) || 0;

    return {
      success: true,
      stats: {
        totalChats,
        totalMessages,
        averageMessagesPerChat: totalChats > 0 ? Math.round(totalMessages / totalChats) : 0
      }
    };

  } catch (error) {
    console.error('❌ Get chat stats failed:', error);
    return {
      success: false,
      stats: { totalChats: 0, totalMessages: 0, averageMessagesPerChat: 0 }
    };
  }
};
