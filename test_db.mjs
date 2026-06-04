import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCustomers() {
  const { data, error } = await supabase.from('customers').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success, data:', data);
  }
}
checkCustomers();
