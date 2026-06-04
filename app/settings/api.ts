import { supabase } from "@/lib/supabase";

export async function fetchOrganizationSettings() {
  const { data, error } = await supabase
    .from("settings_organization")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching organization settings:", error);
    return null;
  }
  return data;
}

export async function updateOrganizationSettings(id: string | undefined, payload: any) {
  if (id) {
    const { data, error } = await supabase
      .from("settings_organization")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("settings_organization")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data;
}

export async function fetchAlertSettings() {
  const { data, error } = await supabase
    .from("settings_alerts")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching alert settings:", error);
    return null;
  }
  return data;
}

export async function updateAlertSettings(id: string | undefined, payload: any) {
  if (id) {
    const { data, error } = await supabase
      .from("settings_alerts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("settings_alerts")
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

export async function fetchSubscription() {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription:", error);
    return null;
  }
  return data;
}

export async function askKnowledgeBase(question: string) {
  // Save question to history
  await supabase.from("knowledge_base_history").insert([{ question }]);

  // Simulate an AI response delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lowerQ = question.toLowerCase();

  // Mock answers based on the prompt's examples
  if (lowerQ.includes("add inventory")) {
    return "1. Go to **Inventory** in the left menu.\n2. Click the **+ Add Product** button in the top right.\n3. Fill in the product details like name, SKU, price, and initial stock.\n4. Click **Save Product**.\n\n*Tip: Make sure to set a Low Stock Threshold to get alerted when supplies run low.*";
  }
  if (lowerQ.includes("purchase order")) {
    return "1. Navigate to **Purchases**.\n2. Click **Create Purchase**.\n3. Select your Supplier from the dropdown (or add a new one).\n4. Add the items you are purchasing and their quantities.\n5. Click **Save Purchase Order**.";
  }
  if (lowerQ.includes("low stock")) {
    return "1. Open **Inventory**.\n2. Use the **Filter** option and select **Low Stock**.\n3. You can also view this on the **Dashboard** under the Low Stock summary card.";
  }

  return "I'm still learning! While I don't have a specific answer for that yet, you can try checking the relevant module from the left menu or contact our support team.";
}
