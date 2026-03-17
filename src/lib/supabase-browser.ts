import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tikyjfiaytlubjrlvlus.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpa3lqZmlheXRsdWJqcmx2bHVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjAwNjMsImV4cCI6MjA4OTIzNjA2M30.DnHHT3ULEr5khofwmR6uraaHmwdv-XOwfmMSgFQ72T4";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
