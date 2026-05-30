export const FashionConfig = {
  sidebar: [
    { name: "Dashboard", label: "Dashboard" },
    { name: "Inventory", label: "Products" },
    { name: "Sales", label: "Orders" },
    { name: "Purchases", label: "Purchases" },
    { name: "Returns", label: "Returns" },
    { name: "Expenses", label: "Expenses" },
    { name: "Customers", label: "Buyers" },
    { name: "Reports", label: "Reports" },
    { name: "Goals", label: "Sales Goals" },
    { name: "Settings", label: "Settings" }
  ],
  dashboardCards: [
    { key: "Total Sales", title: "Total Revenue" },
    { key: "Total Items Sold", title: "Total Pieces Sold" },
    { key: "Net Profit", title: "Net Profit" },
    { key: "Margin (% Gained)", title: "Profit Margin" },
    { key: "Avg Order Value (AOV)", title: "Avg Order Value (AOV)" },
    { key: "Pending Packing", title: "Pending Shipping" },
    { key: "Low Stock Items", title: "Low Stock Products" },
    { key: "Total Expenses", title: "Total Expenses" }
  ],
  chartLabels: [
    { key: "salesTrend", label: "Order Trend (Last 7 Days)" },
    { key: "categoryShare", label: "Collection Share (Sales)" },
    { key: "expenseBreakdown", label: "Operating Expense Breakdown" }
  ],
  modules: [
    { 
      key: "Inventory", 
      displayName: "Products", 
      singularDisplayName: "Product", 
      description: "Manage your clothing collections, sizes, variants, and stock.", 
      emptyStateText: "No apparel items or accessories found." 
    },
    { 
      key: "Sales", 
      displayName: "Orders", 
      singularDisplayName: "Order", 
      description: "Manage your client orders, invoice details and fulfillment status.", 
      emptyStateText: "No sales orders placed yet." 
    },
    { 
      key: "Customers", 
      displayName: "Buyers", 
      singularDisplayName: "Buyer", 
      description: "Manage your boutique clients, bulk buyers, and purchase history.", 
      emptyStateText: "No buyers in your registry yet." 
    },
    { 
      key: "Purchases", 
      displayName: "Purchases", 
      singularDisplayName: "Fabric Purchase", 
      description: "Track materials purchased from textile suppliers and manufacturers.", 
      emptyStateText: "No purchase orders registered yet." 
    },
    { 
      key: "Returns", 
      displayName: "Returns", 
      singularDisplayName: "Return", 
      description: "Process buyer return requests, sizing swaps, and refunds.", 
      emptyStateText: "No returns requested yet." 
    },
    { 
      key: "Expenses", 
      displayName: "Expenses", 
      singularDisplayName: "Expense", 
      description: "Track your design, storage, and marketing costs.", 
      emptyStateText: "No expenses recorded yet." 
    },
    { 
      key: "Goals", 
      displayName: "Sales Goals", 
      singularDisplayName: "Sales Goal", 
      description: "Define and monitor boutique monthly sales targets.", 
      emptyStateText: "No sales goals set for this season." 
    }
  ],
  sampleData: {
    products: [
      { display_id: "PRD-001", name: "Premium Cotton Slim-Fit Shirt (White)", sku: "FSH-SH-01", category: "Apparel", purchase_price: 600, price: 1499, stock: 85, status: "Active" },
      { display_id: "PRD-002", name: "Classic Denim Jacket (Indigo)", sku: "FSH-JK-02", category: "Outerwear", purchase_price: 1200, price: 2999, stock: 14, status: "Low Stock" },
      { display_id: "PRD-003", name: "Silk Evening Dress (Midnight Blue)", sku: "FSH-DR-03", category: "Apparel", purchase_price: 2500, price: 5499, stock: 0, status: "Out of Stock" },
      { display_id: "PRD-004", name: "Handcrafted Leather Boots (Brown)", sku: "FSH-BT-04", category: "Footwear", purchase_price: 1800, price: 3999, stock: 42, status: "Active" },
      { display_id: "PRD-005", name: "Retro Acetate Sunglasses", sku: "FSH-AC-05", category: "Accessories", purchase_price: 350, price: 999, stock: 120, status: "Active" }
    ],
    orders: [
      { display_id: "ORD-9012", customer: "Vikram Singh", date: "13 May 2026, 10:45 AM", amount: "₹2,498", payment: "Paid", status: "New", address: "Apt 4B, Colaba Causeway, Mumbai", phone: "+91 98765 00112", items: [{ name: "Retro Acetate Sunglasses", qty: 1, price: "₹999" }, { name: "Premium Cotton Slim-Fit Shirt (White)", qty: 1, price: "₹1499" }] },
      { display_id: "ORD-9011", customer: "Ananya Sen", date: "13 May 2026, 09:15 AM", amount: "₹2,999", payment: "Paid", status: "Packed", address: "Flat 12, Salt Lake Sector V, Kolkata", phone: "+91 98765 00223", items: [{ name: "Classic Denim Jacket (Indigo)", qty: 1, price: "₹2999" }] },
      { display_id: "ORD-9010", customer: "Rohit Mehta", date: "12 May 2026, 04:30 PM", amount: "₹7,998", payment: "COD", status: "Shipped", address: "House 89, DLF Phase 3, Gurgaon", phone: "+91 98765 00334", items: [{ name: "Handcrafted Leather Boots (Brown)", qty: 2, price: "₹3999" }] }
    ],
    expenses: [
      { display_id: "EXP-900", category: "Production", amount: 15000, notes: "Boutique photoshoot studio booking", date: new Date().toISOString() },
      { display_id: "EXP-899", category: "Marketing", amount: 20000, notes: "Instagram influencer collaboration campaign", date: new Date(Date.now() - 86400000).toISOString() },
      { display_id: "EXP-898", category: "Logistics", amount: 2450, notes: "DHL Express client shipments", date: new Date(Date.now() - 172800000).toISOString() }
    ]
  },
  helperText: [
    { key: "searchProducts", text: "Search products by style, name or SKU..." },
    { key: "searchSales", text: "Search by buyer name, order # or status..." },
    { key: "searchCustomers", text: "Search by buyer name, email or phone..." },
    { key: "companyNameLabel", text: "Brand Name" },
    { key: "gstInLabel", text: "GSTIN / VAT ID" },
    { key: "returnAddressLabel", text: "Showroom Return Address" }
  ]
};
