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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase configuration");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const newProducts = [
  {
    display_id: "PRD-9991",
    name: "Chudithar",
    sku: "INBA-CHUDI-TEMP",
    category: "Chudi Materials",
    purchase_price: 250,
    price: 499,
    stock: 50,
    status: "Active",
    created_at: "2026-04-01T12:00:00.000Z"
  },
  {
    display_id: "PRD-9992",
    name: "Boutique Sale",
    sku: "INBA-BOUTIQUE-TEMP",
    category: "Chudi Materials",
    purchase_price: 250,
    price: 499,
    stock: 50,
    status: "Active",
    created_at: "2026-04-01T12:00:00.000Z"
  }
];

async function run() {
  console.log("Checking if imported products exist in database...");
  
  for (const prod of newProducts) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("name", prod.name);
      
    if (existing && existing.length > 0) {
      console.log(`⚠️ Product "${prod.name}" already exists, skipping.`);
      continue;
    }
    
    const { data: inserted, error } = await supabase
      .from("products")
      .insert([prod])
      .select()
      .single();
      
    if (error) {
      console.error(`❌ Failed to insert product "${prod.name}":`, error.message);
    } else {
      console.log(`✅ Product "${prod.name}" registered under category "${prod.category}"`);
    }
  }
  
  console.log("Import completed!");
}

run();
