import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ycesvbwivmhfglemhcir.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZXN2Yndpdm1oZmdsZW1oY2lyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjAzNjMxMCwiZXhwIjoyMDk3NjEyMzEwfQ.O_j5vYzM4IpAIfIKh0DQ_LoZuwYYcfiPOzSnU-R0Ejs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
