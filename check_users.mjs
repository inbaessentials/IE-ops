import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  const { data: users, error: e1 } = await supabase.from('users').select('*').limit(1);
  console.log('Users Error:', e1);
  const { data: roles, error: e2 } = await supabase.from('roles').select('*').limit(1);
  console.log('Roles Error:', e2);
}

run();
