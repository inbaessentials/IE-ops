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
  console.log("Fetching all orders chronologically...");
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, display_id, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching orders:", error);
    return;
  }

  console.log(`Found ${orders.length} orders. Phase 1: Clearing to temporary IDs...`);
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const tempDisplayId = `ORD-TMP-${i}-${Math.random().toString(36).substring(2, 6)}`;
    const { error: tempError } = await supabase
      .from("orders")
      .update({ display_id: tempDisplayId })
      .eq("id", order.id);
    if (tempError) {
      console.error(`Failed to set temporary ID for order ${order.id}:`, tempError.message);
    }
  }

  console.log("Phase 2: Re-assigning to clean sequential numbering chronologically...");
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const newDisplayId = `ORD-${String(i + 1).padStart(4, "0")}`;
    console.log(`Updating order ${order.id} -> ${newDisplayId}`);
    
    const { error: updateError } = await supabase
      .from("orders")
      .update({ display_id: newDisplayId })
      .eq("id", order.id);

    if (updateError) {
      console.error(`Failed to assign sequential ID to order ${order.id}:`, updateError.message);
    }
  }

  console.log("All existing orders have been successfully updated to clean sequential numbering!");
}

run();
