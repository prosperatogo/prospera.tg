import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vjavkkhicnhkfeehrzgq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqYXZra2hpY25oa2ZlZWhyemdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNjcxMzIsImV4cCI6MjA3Nzk0MzEzMn0.ByaUcINISSHWjMtVxZbrP-EITYtndYvYFie_Fim_dQE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
