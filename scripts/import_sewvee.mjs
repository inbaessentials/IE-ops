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
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sewveeOrders = [
  {
    customer: "Saranya",
    phone: "",
    address: "Imported from Sewvee",
    date: "26 Apr 2026, 12:00 PM",
    created_at: "2026-04-26T12:00:00.000Z",
    amount: "₹1,500",
    payment: "Paid",
    status: "Delivered",
    display_id: "ORD-TEMP-001",
    items: [
      { name: "Chudithar", qty: 3, price: "₹500" }
    ]
  },
  {
    customer: "Karpagam",
    phone: "",
    address: "Imported from Sewvee",
    date: "25 Apr 2026, 12:00 PM",
    created_at: "2026-04-25T12:00:00.000Z",
    amount: "₹5,988",
    payment: "Paid",
    status: "Delivered",
    display_id: "ORD-TEMP-002",
    items: [
      { name: "Chudithar", qty: 12, price: "₹499" }
    ]
  },
  {
    customer: "Suganya",
    phone: "",
    address: "Imported from Sewvee",
    date: "20 Apr 2026, 12:00 PM",
    created_at: "2026-04-20T12:00:00.000Z",
    amount: "₹1,120",
    payment: "Paid",
    status: "Delivered",
    display_id: "ORD-TEMP-003",
    items: [
      { name: "Chudithar", qty: 2, price: "₹560" }
    ]
  },
  {
    customer: "Shanmans",
    phone: "9488231333",
    address: "Imported from Sewvee",
    date: "11 Apr 2026, 12:00 PM",
    created_at: "2026-04-11T12:00:00.000Z",
    amount: "₹499",
    payment: "Paid",
    status: "Delivered",
    display_id: "ORD-TEMP-004",
    items: [
      { name: "Boutique Sale", qty: 1, price: "₹499" }
    ]
  },
  {
    customer: "Archana",
    phone: "6374231447",
    address: "Imported from Sewvee",
    date: "11 Apr 2026, 12:00 PM",
    created_at: "2026-04-11T12:00:00.000Z",
    amount: "₹499",
    payment: "Paid",
    status: "Delivered",
    display_id: "ORD-TEMP-005",
    items: [
      { name: "Boutique Sale", qty: 1, price: "₹499" }
    ]
  },
  {
    customer: "Dharani",
    phone: "6381674045",
    address: "Imported from Sewvee",
    date: "11 Apr 2026, 12:00 PM",
    created_at: "2026-04-11T12:00:00.000Z",
    amount: "₹2,795",
    payment: "Paid",
    status: "Delivered",
    display_id: "ORD-TEMP-006",
    items: [
      { name: "Boutique Sale", qty: 5, price: "₹559" }
    ]
  }
];

const sewveeExpenses = [
  {
    category: "Packaging",
    amount: 210,
    notes: "Chudithar Cover - Sewvee Import",
    date: "2026-04-27T12:00:00.000Z",
    created_at: "2026-04-27T12:00:00.000Z",
    display_id: "EXP-TEMP-001"
  },
  {
    category: "Utility",
    amount: 200,
    notes: "Jio Recharge - Sewvee Import",
    date: "2026-04-27T12:00:00.000Z",
    created_at: "2026-04-27T12:00:00.000Z",
    display_id: "EXP-TEMP-002"
  },
  {
    category: "Office Supplies",
    amount: 260,
    notes: "Paper Bundle - Sewvee Import",
    date: "2026-04-26T12:00:00.000Z",
    created_at: "2026-04-26T12:00:00.000Z",
    display_id: "EXP-TEMP-003"
  },
  {
    category: "Ads",
    amount: 1500,
    notes: "Ad Campaign - Sewvee Import",
    date: "2026-04-26T12:00:00.000Z",
    created_at: "2026-04-26T12:00:00.000Z",
    display_id: "EXP-TEMP-004"
  },
  {
    category: "Marketing",
    amount: 1200,
    notes: "Domain Purchase - Sewvee Import",
    date: "2026-04-26T12:00:00.000Z",
    created_at: "2026-04-26T12:00:00.000Z",
    display_id: "EXP-TEMP-005"
  },
  {
    category: "Office Supplies",
    amount: 300,
    notes: "Dmart - Sewvee Import",
    date: "2026-04-25T12:00:00.000Z",
    created_at: "2026-04-25T12:00:00.000Z",
    display_id: "EXP-TEMP-006"
  },
  {
    category: "Ads",
    amount: 800,
    notes: "Ad Campaign - Sewvee Import",
    date: "2026-04-20T12:00:00.000Z",
    created_at: "2026-04-20T12:00:00.000Z",
    display_id: "EXP-TEMP-007"
  },
  {
    category: "Marketing",
    amount: 800,
    notes: "Mic - Sewvee Import",
    date: "2026-04-20T12:00:00.000Z",
    created_at: "2026-04-20T12:00:00.000Z",
    display_id: "EXP-TEMP-008"
  }
];

async function runImport() {
  console.log("🚀 Starting Sewvee Business Ledger April 2026 Data Import...");

  // 1. Insert Sales Orders & Order Items
  console.log("\n📦 Importing Sales Orders & Order Items...");
  for (const order of sewveeOrders) {
    const { items, ...orderData } = order;

    // Check if the order already exists to avoid duplicates (based on customer and unique created_at)
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('customer', orderData.customer)
      .eq('created_at', orderData.created_at);

    if (existing && existing.length > 0) {
      console.log(`⚠️ Order for ${orderData.customer} on ${orderData.date} already exists, skipping.`);
      continue;
    }

    // Insert Order
    const { data: insertedOrder, error: oError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (oError) {
      console.error(`❌ Error inserting order for ${orderData.customer}:`, oError.message);
      continue;
    }

    console.log(`✅ Inserted order for ${orderData.customer} (ID: ${insertedOrder.id})`);

    // Insert Items
    if (items && items.length > 0) {
      const itemsPayload = items.map(item => ({
        ...item,
        order_id: insertedOrder.id
      }));

      const { error: oiError } = await supabase.from('order_items').insert(itemsPayload);
      if (oiError) {
        console.error(`❌ Error inserting items for order of ${orderData.customer}:`, oiError.message);
      } else {
        console.log(`   - Attached ${itemsPayload.length} order item(s)`);
      }
    }
  }

  // 2. Insert Expenses
  console.log("\n💸 Importing Expense Audit Records...");
  for (const exp of sewveeExpenses) {
    // Check if the expense already exists (based on notes and created_at)
    const { data: existingExp } = await supabase
      .from('expenses')
      .select('id')
      .eq('notes', exp.notes)
      .eq('created_at', exp.created_at);

    if (existingExp && existingExp.length > 0) {
      console.log(`⚠️ Expense '${exp.notes}' on ${exp.date} already exists, skipping.`);
      continue;
    }

    // Insert Expense
    const { data: insertedExp, error: eError } = await supabase
      .from('expenses')
      .insert(exp)
      .select()
      .single();

    if (eError) {
      console.error(`❌ Error inserting expense '${exp.notes}':`, eError.message);
      continue;
    }

    console.log(`✅ Inserted expense '${exp.notes}' of ₹${exp.amount}`);
  }

  // 3. Resequence Expenses Sequentially
  console.log("\n🔢 Sequentializing Expense Display IDs chronologically...");
  const { data: allExpenses, error: feError } = await supabase
    .from('expenses')
    .select('id, notes, created_at')
    .order('created_at', { ascending: true });

  if (!feError && allExpenses) {
    for (let i = 0; i < allExpenses.length; i++) {
      const exp = allExpenses[i];
      const newDisplayId = `EXP-${String(i + 901).padStart(3, "0")}`; // Let's keep sequence starting at EXP-901
      
      const { error: ueError } = await supabase
        .from('expenses')
        .update({ display_id: newDisplayId })
        .eq('id', exp.id);
      
      if (ueError) {
        console.error(`❌ Failed to sequentialize expense ID for ${exp.notes}:`, ueError.message);
      }
    }
    console.log("✅ All expenses sequentialized successfully!");
  }

  console.log("\n🎉 Sewvee Business Ledger April data import completed successfully!");
}

runImport();
