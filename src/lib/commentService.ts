// commentService.ts
import { supabase } from '../lib/supabase';

export const fetchComments = async (streamId: string) => {
  const { data, error } = await supabase
    .from('stream_comments')
    .select('*')
    .eq('stream_id', streamId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch comments:', error);
    return [];
  }

  return data;
};

export const addComment = async (
  streamId: string,
  userName: string,
  avatarUrl: string,
  message: string
) => {
  const { error } = await supabase.from('stream_comments').insert([
    {
      stream_id: streamId,
      user_name: userName,
      avatar_url: avatarUrl,
      message,
    },
  ]);

  if (error) {
    console.error('Failed to save comment:', error);
  }
};
