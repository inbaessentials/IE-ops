"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

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

export default function SetupPage() {
  const [status, setStatus] = useState<string>("Ready to seed database.");
  const [loading, setLoading] = useState(false);

  const seedData = async () => {
    setLoading(true);
    setStatus("Seeding products...");
    
    // Seed Products
    const { error: pError } = await supabase.from('products').insert(initialProducts);
    if (pError) { setStatus("Error products: " + pError.message); setLoading(false); return; }

    setStatus("Seeding expenses...");
    // Seed Expenses
    const { error: eError } = await supabase.from('expenses').insert(initialExpenses);
    if (eError) { setStatus("Error expenses: " + eError.message); setLoading(false); return; }

    setStatus("Seeding orders...");
    // Seed Orders and Items
    for (const order of initialOrders) {
      const { items, ...orderData } = order;
      const { data: insertedOrder, error: oError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (oError) {
        setStatus("Error orders: " + oError.message); setLoading(false); return;
      }

      if (items && items.length > 0) {
        const orderItems = items.map(item => ({
          ...item,
          order_id: insertedOrder.id
        }));
        await supabase.from('order_items').insert(orderItems);
      }
    }

    setStatus("Success! All data pushed to Supabase.");
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Database Setup</h1>
        <p className="text-gray-600 text-sm">
          Click the button below to push all your initial dummy data directly into your Supabase project.
        </p>
        
        <div className="p-4 bg-gray-50 rounded-lg text-xs font-mono text-left break-all text-gray-500">
          {status}
        </div>

        <Button 
          onClick={seedData} 
          disabled={loading} 
          className="w-full h-12 text-base font-semibold shadow-sm"
        >
          {loading ? "Pushing Data..." : "Push Data to Supabase"}
        </Button>
      </div>
    </div>
  );
}
