import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Client có gắn header x-device-id
export const supabaseWithDevice = (deviceId) =>
  createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
    global: {
      headers: { 'x-device-id': deviceId },
    },
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
