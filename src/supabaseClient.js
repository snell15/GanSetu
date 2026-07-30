import { createClient } from '@supabase/supabase-js'

// You will get these URLs from your Supabase Dashboard -> Project Settings -> API
const supabaseUrl = 'https://czxnmvalntltypsoenia.supabase.co'
const supabaseAnonKey = 'sb_publishable_w5Y7saygvuAJVxWN4a0uZw_JfULwMDp'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)