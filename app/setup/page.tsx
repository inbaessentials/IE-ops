"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { usePlatform } from "@/lib/PlatformContext";

export default function SetupPage() {
  const { platform, config } = usePlatform();
  const [status, setStatus] = useState<string>("Ready to seed database.");
  const [loading, setLoading] = useState(false);

  const seedData = async () => {
    setLoading(true);
    
    // Clear database first to avoid display_id conflicts when switching platforms
    setStatus("Clearing existing data...");
    try {
      await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (err: any) {
      console.warn("Table cleanup warnings:", err);
    }

    setStatus("Seeding products...");
    // Seed Products
    const { error: pError } = await supabase.from('products').insert(config.sampleData.products);
    if (pError) { setStatus("Error products: " + pError.message); setLoading(false); return; }

    setStatus("Seeding expenses...");
    // Seed Expenses
    const { error: eError } = await supabase.from('expenses').insert(config.sampleData.expenses);
    if (eError) { setStatus("Error expenses: " + eError.message); setLoading(false); return; }

    setStatus("Seeding orders...");
    // Seed Orders and Items
    for (const order of config.sampleData.orders) {
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
        const orderItems = items.map((item: any) => ({
          ...item,
          order_id: insertedOrder.id
        }));
        await supabase.from('order_items').insert(orderItems);
      }
    }

    setStatus(`Success! All ${platform.toUpperCase()} data pushed to Supabase.`);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">Database Setup ({platform.toUpperCase()})</h1>
        <p className="text-gray-600 text-sm">
          Click the button below to push all your dynamic seed data for <strong>{platform.toUpperCase()}</strong> directly into your Supabase project.
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

