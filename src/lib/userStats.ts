import { supabase } from './supabase';

// Fetch user stats or create default if not found
export const getUserStats = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    const { data: newStats, error: insertError } = await supabase
      .from('user_stats')
      .insert({
        id: userId,
        xp: 0,
        streak: 0,
        energy: 100,
        last_active: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newStats;
  }

  if (error) throw error;
  return data;
};

// Main updater for gamification: XP, energy, streak
export const updateUserStats = async (
  userId: string,
  {
    xp = 0,
    energy = 0,
    streakIncrement = false,
  }: { xp?: number; energy?: number; streakIncrement?: boolean }
) => {
  // 1. Get current stats or default
  const stats = await getUserStats(userId);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // 2. Update logic
  const updatedStats = {
    xp: stats.xp + xp,
    energy: Math.max(stats.energy + energy, 0),
    streak: stats.streak,
    last_active: stats.last_active,
  };

  // 3. Streak logic
  if (streakIncrement) {
    if (stats.last_active === today) {
      // already counted today
    } else if (stats.last_active === yesterday) {
      updatedStats.streak += 1;
    } else {
      updatedStats.streak = 1;
    }
    updatedStats.last_active = today;
  }

  // 4. Update database
  const { error } = await supabase
    .from('user_stats')
    .update(updatedStats)
    .eq('id', userId);

  if (error) throw error;
};
