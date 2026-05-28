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

async function runMigration() {
  console.log("🚀 Starting Category Split Migration (Chudi Materials -> Inba Stock & Raw Silk)...");

  // 1. Fetch products currently under 'Chudi Materials'
  const { data: products, error: pFetchError } = await supabase
    .from("products")
    .select("id, name, price, category")
    .eq("category", "Chudi Materials");

  if (pFetchError) {
    console.error("❌ Error fetching products:", pFetchError.message);
    process.exit(1);
  }

  console.log(`Found ${products.length} products under category 'Chudi Materials'.`);

  let inbaStockCount = 0;
  let rawSilkCount = 0;

  for (const p of products) {
    const targetCategory = p.price <= 500 ? "Inba Stock" : "Raw Silk";
    console.log(`- Updating "${p.name}" (Price: ₹${p.price}) -> ${targetCategory}`);

    const { error: pUpdateError } = await supabase
      .from("products")
      .update({ category: targetCategory })
      .eq("id", p.id);

    if (pUpdateError) {
      console.error(`  ❌ Failed to update "${p.name}":`, pUpdateError.message);
    } else {
      if (p.price <= 500) inbaStockCount++;
      else rawSilkCount++;
    }
  }

  console.log(`\n✅ Product updates completed:`);
  console.log(`   - ${inbaStockCount} products moved to 'Inba Stock' (priced <= ₹500)`);
  console.log(`   - ${rawSilkCount} products moved to 'Raw Silk' (priced > ₹500)`);

  // 2. Fetch and update goals linked to 'Chudi Materials'
  console.log("\n🎯 Inspecting active business goals linked to 'Chudi Materials'...");
  const { data: goals, error: gFetchError } = await supabase
    .from("goals")
    .select("id, name, linked_value")
    .eq("linked_value", "Chudi Materials");

  if (gFetchError) {
    console.warn("⚠️ Could not query goals table:", gFetchError.message);
  } else if (goals && goals.length > 0) {
    console.log(`Found ${goals.length} goals linked to 'Chudi Materials'. Redirecting to 'Inba Stock'...`);
    
    for (const g of goals) {
      const { error: gUpdateError } = await supabase
        .from("goals")
        .update({ linked_value: "Inba Stock" })
        .eq("id", g.id);

      if (gUpdateError) {
        console.error(`  ❌ Failed to redirect goal "${g.name}":`, gUpdateError.message);
      } else {
        console.log(`  ✅ Redirected goal "${g.name}" to 'Inba Stock'`);
      }
    }
  } else {
    console.log("✅ No active goals were linked to 'Chudi Materials'.");
  }

  console.log("\n🎉 Database category separation completed successfully!");
}

runMigration();
