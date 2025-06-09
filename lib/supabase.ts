import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://vjmtcljmtchsfqiypjga.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqbXRjbGptdGNoc2ZxaXlwamdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTIzODAsImV4cCI6MjA2Mzc2ODM4MH0.KiRdI2wNmJFAnKahgNMi7K2gntYohwqnQDZtjhytemA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
