import { supabase } from './supabase';

// Create or get existing peer chat for user
export const findOrCreatePeerChat = async (userId: string) => {
  // First, check if there's already a chat for this user
  const { data: existingChats, error: findError } = await supabase
    .from('peer_chats')
    .select('*')
    .or(`user1.eq.${userId},user2.eq.${userId}`)
    .limit(1);

  if (findError) throw findError;
  if (existingChats.length > 0) return existingChats[0];

  // No existing chat, so match with another available user
  const { data: unmatchedUsers, error: fetchError } = await supabase
    .from('peer_chats')
    .select('*')
    .is('user2', null)
    .not('user1', 'eq', userId)
    .limit(1);

  if (fetchError) throw fetchError;

  if (unmatchedUsers.length > 0) {
    const match = unmatchedUsers[0];
    const { data: updated, error: updateError } = await supabase
      .from('peer_chats')
      .update({ user2: userId })
      .eq('id', match.id)
      .select()
      .single();

    if (updateError) throw updateError;
    return updated;
  }

  // If no match, create a new waiting chat
  const { data: newChat, error: createError } = await supabase
    .from('peer_chats')
    .insert([{ user1: userId }])
    .select()
    .single();

  if (createError) throw createError;
  return newChat;
};

// Send message
export const sendPeerMessage = async (chatId: string, senderId: string, message: string) => {
  const { data, error } = await supabase.from('peer_messages').insert([
    {
      chat_id: chatId,
      sender_id: senderId,
      message,
    },
  ]);

  if (error) throw error;
  return data;
};

// Fetch messages
export const fetchPeerMessages = async (chatId: string) => {
  const { data, error } = await supabase
    .from('peer_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
