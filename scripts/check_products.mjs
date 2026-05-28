import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("Checking products...");
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error("Error fetching products:", error);
    return;
  }
  console.log("Found products:");
  products.forEach(p => {
    console.log(`- [${p.display_id}] ${p.name} (SKU: ${p.sku}) | Category: ${p.category} | Price: ₹${p.price}`);
  });
}

check();
