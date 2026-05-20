import { createClient } from '@supabase/supabase-js';

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

  console.log(`Found ${orders.length} orders. Re-numbering sequentially...`);
  
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const newDisplayId = `ORD-${String(i + 1).padStart(4, "0")}`;
    console.log(`Updating ${order.display_id} (ID: ${order.id}) -> ${newDisplayId}`);
    
    const { error: updateError } = await supabase
      .from("orders")
      .update({ display_id: newDisplayId })
      .eq("id", order.id);

    if (updateError) {
      console.error(`Failed to update ${order.display_id}:`, updateError);
    }
  }

  console.log("All existing orders have been successfully updated to clean sequential numbering!");
}

run();
