import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://binlxqogxrkaulqqtpib.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbmx4cW9neHJrYXVscXF0cGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5NTk4OTMsImV4cCI6MjA1NDUzNTg5M30.6q6ynsDCYvrXEb7ukwOESeOGWwIysYyeT9yXxjt8TmI';

export const supabase = createClient(supabaseUrl, supabaseKey);