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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching all products chronologically...");
  const { data: products, error } = await supabase
    .from("products")
    .select("id, sku, name, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  console.log(`Found ${products.length} products. Re-numbering SKUs sequentially...`);
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const newSku = `INBA-${String(i + 1).padStart(4, "0")}`;
    console.log(`Updating product "${product.name}" SKU: ${product.sku} -> ${newSku}`);
    
    const { error: updateError } = await supabase
      .from("products")
      .update({ sku: newSku })
      .eq("id", product.id);

    if (updateError) {
      console.error(`Failed to update product "${product.name}":`, updateError);
    }
  }

  console.log("All existing products have been successfully updated to clean sequential SKUs starting from 0001!");
}

run();
