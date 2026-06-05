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
  const { id: _id, created_at, ...updatePayload } = payload;
  if (id) {
    const { data, error } = await supabase
      .from("settings_organization")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();
    if (error) { console.error("Supabase Update Org Error:", error); throw error; }
    return data;
  } else {
    const { data, error } = await supabase
      .from("settings_organization")
      .insert([updatePayload])
      .select()
      .single();
    if (error) { console.error("Supabase Insert Org Error:", error); throw error; }
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

export async function fetchRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
  return data;
}

export async function createRole(payload: any) {
  const { data, error } = await supabase
    .from("roles")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRole(id: string, payload: any) {
  const { data, error } = await supabase
    .from("roles")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function inviteUser(payload: { name: string; email: string; role: string; status: string }) {
  const { data, error } = await supabase
    .from("users")
    .insert([{
      name: payload.name,
      email: payload.email,
      role: payload.role,
      status: payload.status,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
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
  const { id: _id, created_at, ...updatePayload } = payload;
  if (id) {
    const { data, error } = await supabase
      .from("settings_alerts")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();
    if (error) { console.error("Supabase Update Alert Error:", error); throw error; }
    return data;
  } else {
    const { data, error } = await supabase
      .from("settings_alerts")
      .insert([updatePayload])
      .select()
      .single();
    if (error) { console.error("Supabase Insert Alert Error:", error); throw error; }
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

  const qaDatabase = [
    {
      keywords: ["add inventory", "new product", "create product"],
      answer: "1. Go to **Inventory** in the left menu.\n2. Click the **+ Add Product** button in the top right.\n3. Fill in the product details like name, SKU, price, and initial stock.\n4. Click **Save Product**.\n\n*Tip: Make sure to set a Low Stock Threshold to get alerted when supplies run low.*"
    },
    {
      keywords: ["purchase order", "buy stock", "supplier"],
      answer: "1. Navigate to **Purchases**.\n2. Click **Create Purchase**.\n3. Select your Supplier from the dropdown (or add a new one).\n4. Add the items you are purchasing and their quantities.\n5. Click **Save Purchase Order**."
    },
    {
      keywords: ["low stock", "out of stock"],
      answer: "1. Open **Inventory**.\n2. Use the **Filter** option and select **Low Stock**.\n3. You can also view this on the **Dashboard** under the Action Center card."
    },
    {
      keywords: ["track expenses", "add expense", "record cost", "spending"],
      answer: "1. Go to **Expenses** from the sidebar.\n2. Click **+ Add Expense**.\n3. Enter the amount, category, date, and description.\n4. Save it to immediately see it reflected in your Profit & Loss reports."
    },
    {
      keywords: ["sales report", "revenue report", "profit", "reports", "export data"],
      answer: "1. Go to **Reports**.\n2. View the **Revenue Trends** or **Profit & Loss** charts.\n3. You can filter the time period using the dropdown in the top right corner."
    },
    {
      keywords: ["add customer", "new customer", "client"],
      answer: "1. Navigate to **Customers**.\n2. Click the **+ Add Customer** button.\n3. Enter their Name, Phone, and shipping details.\n4. Click **Save** to start tracking their order history."
    },
    {
      keywords: ["set goal", "sales target", "objective", "goals"],
      answer: "1. Open the **Goals** module.\n2. Click **+ New Goal**.\n3. Choose between Sales Target, Order Volume, or Customer Acquisition.\n4. Set your timeframe and target value."
    },
    {
      keywords: ["add user", "invite staff", "permissions", "roles"],
      answer: "1. Go to **Settings** > **Users & Roles**.\n2. Click **+ Invite User**.\n3. Assign them a role (Admin, Manager, Staff) to control their permissions across modules."
    },
    {
      keywords: ["create order", "new order", "record sale", "checkout"],
      answer: "1. Go to **Orders**.\n2. Click **+ New Order**.\n3. Search for the customer or create a new one.\n4. Add products to their cart.\n5. Select the payment status and save to deduct inventory automatically."
    }
  ];

  for (const entry of qaDatabase) {
    if (entry.keywords.some(kw => lowerQ.includes(kw))) {
      return entry.answer;
    }
  }

  return "I'm still learning! While I don't have a specific answer for that yet, you can try checking the relevant module from the left menu or contact our support team at support@inbaessentials.com.";
}
