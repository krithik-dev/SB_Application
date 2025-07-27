// src/lib/lessonProgress.ts
import { supabase } from './supabase';

export async function getUserLessonProgress(userId: string) {
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching progress:', error);
    return [];
  }
  return data;
}

export async function markLessonCompleted(userId: string, lessonId: string, xp: number = 10) {
  const { error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: new Date().toISOString(),
      xp_earned: xp,
    });

  if (error) {
    console.error('Error marking lesson complete:', error);
  }
}
