import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://egywkjchvdagzzflmxye.supabase.co'
const supabaseAnonKey = 'sb_publishable_S4UIckP5RZ3jwkxgBxHU7w_GY0fXO_1'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
