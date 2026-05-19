import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const initialProducts = [
  { display_id: "PRD-001", name: "Herbal Hair Oil (200ml)", sku: "HB-HO-200", category: "Herbal", purchase_price: 150, price: 299, stock: 145, status: "Active" },
  { display_id: "PRD-002", name: "Aloe Vera Face Wash", sku: "CM-AV-100", category: "Cosmetic", purchase_price: 80, price: 199, stock: 12, status: "Low Stock" },
  { display_id: "PRD-003", name: "Organic Honey (500g)", sku: "GR-OH-500", category: "Grocery", purchase_price: 300, price: 450, stock: 0, status: "Out of Stock" },
  { display_id: "PRD-004", name: "Neem Soap Bar", sku: "HB-NS-1", category: "Wellness", purchase_price: 30, price: 75, stock: 320, status: "Active" },
  { display_id: "PRD-005", name: "Rose Water Spray", sku: "BT-RW-50", category: "Beauty", purchase_price: 50, price: 120, stock: 85, status: "Active" },
];

const initialOrders = [
  { display_id: "ORD-9012", customer: "Rahul Sharma", date: "13 May 2026, 10:45 AM", amount: "₹890", payment: "Paid", status: "New", address: "123 Anna Salai, Chennai", phone: "+91 98765 43210", items: [{ name: "Herbal Hair Oil (200ml)", qty: 2, price: "₹299" }, { name: "Neem Soap Bar", qty: 4, price: "₹75" }] },
  { display_id: "ORD-9011", customer: "Priya Patel", date: "13 May 2026, 09:15 AM", amount: "₹1,450", payment: "COD", status: "Packed", address: "45 MG Road, Bangalore", phone: "+91 98765 43211", items: [{ name: "Organic Honey (500g)", qty: 3, price: "₹450" }] },
  { display_id: "ORD-9010", customer: "Anil Kumar", date: "12 May 2026, 04:30 PM", amount: "₹340", payment: "Paid", status: "Shipped", address: "89 Jubilee Hills, Hyderabad", phone: "+91 98765 43212", items: [{ name: "Rose Water Spray", qty: 2, price: "₹120" }, { name: "Aloe Vera Face Wash", qty: 1, price: "₹100" }] },
];

const initialExpenses = [
  { display_id: "EXP-900", category: "Office Supplies", amount: 2500, notes: "Printer ink and paper", date: new Date().toISOString() },
  { display_id: "EXP-899", category: "Marketing", amount: 15000, notes: "Facebook Ads - Diwali Campaign", date: new Date(Date.now() - 86400000).toISOString() },
  { display_id: "EXP-898", category: "Logistics", amount: 450, notes: "Delhivery Shipping charges", date: new Date(Date.now() - 172800000).toISOString() },
];

async function seed() {
  console.log("Seeding data to Supabase...");

  // Insert Products
  const { error: pError } = await supabase.from('products').insert(initialProducts);
  if (pError) console.error("Error inserting products:", pError);
  else console.log("Products inserted successfully!");

  // Insert Expenses
  const { error: eError } = await supabase.from('expenses').insert(initialExpenses);
  if (eError) console.error("Error inserting expenses:", eError);
  else console.log("Expenses inserted successfully!");

  // Insert Orders & Order Items
  for (const order of initialOrders) {
    const { items, ...orderData } = order;
    
    // Insert order
    const { data: insertedOrder, error: oError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (oError) {
      console.error(`Error inserting order ${order.display_id}:`, oError);
      continue;
    }

    // Insert items
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        ...item,
        order_id: insertedOrder.id
      }));

      const { error: oiError } = await supabase.from('order_items').insert(orderItems);
      if (oiError) console.error(`Error inserting items for order ${order.display_id}:`, oiError);
    }
  }
  
  console.log("Orders inserted successfully!");
  console.log("\nDone! All dummy data has been pushed to Supabase.");
}

seed();
