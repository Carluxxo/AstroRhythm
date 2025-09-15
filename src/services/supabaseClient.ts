// src/services/supabaseClient.ts

import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Armazena a sessão no AsyncStorage
    autoRefreshToken: true, // Renova o token automaticamente quando expira
    persistSession: true, // Mantém a sessão salva no dispositivo
    detectSessionInUrl: false, // Ignora a URL, essencial para mobile
  },
});