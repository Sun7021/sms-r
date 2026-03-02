
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rjsxeddvheblotehbeow.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DFVW641x0MNq80ibzUXuEQ_W-tEwp3B';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
