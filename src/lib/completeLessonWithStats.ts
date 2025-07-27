import { supabase } from './supabase';

export const completeLessonWithStats = async (userId: string, lessonId: string) => {
  // 1. Mark lesson as completed if not already
  await supabase.from('lesson_progress').upsert([
    { user_id: userId, lesson_id: lessonId, completed: true },
  ]);

  // 2. Fetch current gamification stats
  const { data: statsRow, error } = await supabase
    .from('user_stats')
    .select('xp, streak, energy')
    .eq('user_id', userId)
    .single();

  if (error || !statsRow) return;

  const updatedXp = statsRow.xp + 10; // +10 XP per lesson
  const updatedStreak = statsRow.streak + 1;
  const updatedEnergy = Math.max(0, statsRow.energy - 5); // Deduct 5% energy

  // 3. Update stats
  await supabase
    .from('user_stats')
    .update({
      xp: updatedXp,
      streak: updatedStreak,
      energy: updatedEnergy,
    })
    .eq('user_id', userId);
};
