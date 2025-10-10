import { supabase } from '../utils/supabaseClient';

export const saveChatHistory = async (userId, messages) => {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id: userId,
          messages: JSON.stringify(messages),
          created_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Save chat error:', error);
    return { success: false, error };
  }
};

export const getChatHistory = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Get chat error:', error);
    return { success: false, error };
  }
};

export const deleteChatHistory = async (userId) => {
  try {
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Delete chat error:', error);
    return { success: false, error };
  }
};
