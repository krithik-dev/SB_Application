// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-url-polyfill/auto'

const supabaseUrl = 'https://ellnmzpivzlrritrqrjb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbG5tenBpdnpscnJpdHJxcmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODcyODEsImV4cCI6MjA2OTE2MzI4MX0.k_N1n-P9doOje854jI1BVVBjxzRfXYaMiuvC0NkvnnU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
