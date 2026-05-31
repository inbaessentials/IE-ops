import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const initialCourses = [
  { display_id: "CRS-101", name: "Digital Marketing Masterclass", sku: "DM-101", category: "Marketing", purchase_price: 0, price: 4999, stock: null, status: "Active" },
  { display_id: "CRS-102", name: "UI/UX Bootcamp", sku: "UX-101", category: "Design", purchase_price: 0, price: 7999, stock: null, status: "Active" },
  { display_id: "CRS-103", name: "AI For Business", sku: "AI-101", category: "Business", purchase_price: 0, price: 9999, stock: null, status: "Active" },
  { display_id: "CRS-104", name: "Spoken English Program", sku: "ENG-101", category: "Language", purchase_price: 0, price: 2999, stock: null, status: "Active" },
  { display_id: "CRS-105", name: "Instagram Growth Academy", sku: "IG-101", category: "Marketing", purchase_price: 0, price: 3499, stock: null, status: "Active" },
  { display_id: "CRS-106", name: "Meta Ads Mastery", sku: "META-101", category: "Marketing", purchase_price: 0, price: 5999, stock: null, status: "Active" },
  { display_id: "CRS-107", name: "Content Creator Blueprint", sku: "CC-101", category: "Content", purchase_price: 0, price: 4499, stock: null, status: "Active" },
];

const initialEnrollments = [
  { display_id: "ENR-0001", customer: "Aditya Sen", date: "31 May 2026, 10:45 AM", amount: 4999, payment: "Paid", status: "Paid", address: "123 Indiranagar, Bangalore", phone: "+91 98765 12345", items: [{ name: "Digital Marketing Masterclass", qty: 1, price: 4999 }] },
  { display_id: "ENR-0002", customer: "Kavya Iyer", date: "30 May 2026, 02:15 PM", amount: 7999, payment: "UPI", status: "Paid", address: "45 Anna Nagar, Chennai", phone: "+91 98765 54321", items: [{ name: "UI/UX Bootcamp", qty: 1, price: 7999 }] },
  { display_id: "ENR-0003", customer: "Nikhil Joshi", date: "29 May 2026, 11:30 AM", amount: 9999, payment: "Credit Card", status: "Paid", address: "89 Jubilee Hills, Hyderabad", phone: "+91 98765 67890", items: [{ name: "AI For Business", qty: 1, price: 9999 }] },
  { display_id: "ENR-0004", customer: "Tara Sharma", date: "28 May 2026, 04:20 PM", amount: 2999, payment: "Pending", status: "Pending", address: "Andheri West, Mumbai", phone: "+91 98765 98765", items: [{ name: "Spoken English Program", qty: 1, price: 2999 }] },
  { display_id: "ENR-0005", customer: "Rohan Desai", date: "27 May 2026, 09:10 AM", amount: 5999, payment: "Failed", status: "Failed", address: "Koramangala, Bangalore", phone: "+91 98765 11111", items: [{ name: "Meta Ads Mastery", qty: 1, price: 5999 }] },
  { display_id: "ENR-0006", customer: "Pooja Verma", date: "26 May 2026, 01:50 PM", amount: 4499, payment: "Refunded", status: "Refunded", address: "Salt Lake, Kolkata", phone: "+91 98765 22222", items: [{ name: "Content Creator Blueprint", qty: 1, price: 4499 }] },
  { display_id: "ENR-0007", customer: "Arun Kumar", date: "25 May 2026, 03:30 PM", amount: 3499, payment: "Partial Payment", status: "Partial Payment", address: "Viman Nagar, Pune", phone: "+91 98765 33333", items: [{ name: "Instagram Growth Academy", qty: 1, price: 3499 }] },
];

const initialExpenses = [
  { display_id: "EXP-900", category: "Software", amount: 2500, notes: "Zoom Pro Subscription", date: new Date().toISOString() },
  { display_id: "EXP-899", category: "Marketing", amount: 15000, notes: "Facebook Ads - Bootcamp Promo", date: new Date(Date.now() - 86400000).toISOString() },
  { display_id: "EXP-898", category: "Hosting", amount: 4500, notes: "AWS Cloud Infrastructure", date: new Date(Date.now() - 172800000).toISOString() },
];

async function seed() {
  console.log("Wiping old ecommerce data...");

  // Delete all orders
  const { error: delOiError } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: delOError } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: delPError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: delEError } = await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log("Seeding new Course data to Supabase...");

  // Insert Courses
  const { error: pError } = await supabase.from('products').insert(initialCourses);
  if (pError) console.error("Error inserting courses:", pError);
  else console.log("Courses inserted successfully!");

  // Insert Expenses
  const { error: eError } = await supabase.from('expenses').insert(initialExpenses);
  if (eError) console.error("Error inserting expenses:", eError);
  else console.log("Expenses inserted successfully!");

  // Insert Enrollments & Items
  for (const enrollment of initialEnrollments) {
    const { items, ...orderData } = enrollment;
    
    // Insert enrollment
    const { data: insertedOrder, error: oError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (oError) {
      console.error(`Error inserting enrollment ${enrollment.display_id}:`, oError);
      continue;
    }

    // Insert items
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        ...item,
        order_id: insertedOrder.id
      }));

      const { error: oiError } = await supabase.from('order_items').insert(orderItems);
      if (oiError) console.error(`Error inserting items for enrollment ${enrollment.display_id}:`, oiError);
    }
  }
  
  console.log("Enrollments inserted successfully!");
  console.log("\nDone! All course data has been pushed to Supabase.");
}

seed();
