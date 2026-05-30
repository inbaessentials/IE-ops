export const OtherConfig = {
  sidebar: [
    { name: "Dashboard", label: "Dashboard" },
    { name: "Inventory", label: "Items" },
    { name: "Sales", label: "Transactions" },
    { name: "Purchases", label: "Procurements" },
    { name: "Returns", label: "Returns" },
    { name: "Expenses", label: "Expenses" },
    { name: "Customers", label: "Clients" },
    { name: "Reports", label: "Reports" },
    { name: "Goals", label: "Performance Goals" },
    { name: "Settings", label: "Settings" }
  ],
  dashboardCards: [
    { key: "Total Sales", title: "Total Revenue" },
    { key: "Total Items Sold", title: "Total Units Transacted" },
    { key: "Net Profit", title: "Net Surplus" },
    { key: "Margin (% Gained)", title: "Operating Margin" },
    { key: "Avg Order Value (AOV)", title: "Avg Transaction Value" },
    { key: "Pending Packing", title: "Pending Actions" },
    { key: "Low Stock Items", title: "Low Level Items" },
    { key: "Total Expenses", title: "Operating Costs" }
  ],
  chartLabels: [
    { key: "salesTrend", label: "Transaction Trend (Last 7 Days)" },
    { key: "categoryShare", label: "Division Share (Sales)" },
    { key: "expenseBreakdown", label: "Expense Breakdown" }
  ],
  modules: [
    { 
      key: "Inventory", 
      displayName: "Items", 
      singularDisplayName: "Item", 
      description: "Manage catalog assets, physical items, and unit volumes.", 
      emptyStateText: "No catalog items found." 
    },
    { 
      key: "Sales", 
      displayName: "Transactions", 
      singularDisplayName: "Transaction", 
      description: "Manage client bookings, receipts and payment entries.", 
      emptyStateText: "No business transactions recorded yet." 
    },
    { 
      key: "Customers", 
      displayName: "Clients", 
      singularDisplayName: "Client", 
      description: "Manage client registrations, contact information, and audit logs.", 
      emptyStateText: "No clients registered in the directory." 
    },
    { 
      key: "Purchases", 
      displayName: "Procurements", 
      singularDisplayName: "Procurement", 
      description: "Track inventory and asset procurements from vendor channels.", 
      emptyStateText: "No procurements registered yet." 
    },
    { 
      key: "Returns", 
      displayName: "Returns", 
      singularDisplayName: "Return", 
      description: "Process custom return orders or service cancellations.", 
      emptyStateText: "No returns or cancellations requested yet." 
    },
    { 
      key: "Expenses", 
      displayName: "Expenses", 
      singularDisplayName: "Expense", 
      description: "Track general operating and administrative expenses.", 
      emptyStateText: "No expenses recorded yet." 
    },
    { 
      key: "Goals", 
      displayName: "Performance Goals", 
      singularDisplayName: "Performance Target", 
      description: "Define and track organizational monthly milestones and targets.", 
      emptyStateText: "No operational performance targets defined for this period." 
    }
  ],
  sampleData: {
    products: [
      { display_id: "PRD-001", name: "Premium Merchandise Unit A", sku: "GEN-MD-01", category: "General", purchase_price: 100, price: 250, stock: 99, status: "Active" },
      { display_id: "PRD-002", name: "Specialized Service Item B", sku: "GEN-SV-02", category: "Services", purchase_price: 50, price: 150, stock: 10, status: "Low Stock" },
      { display_id: "PRD-003", name: "Outsourced License Option C", sku: "GEN-LC-03", category: "Software", purchase_price: 400, price: 900, stock: 0, status: "Out of Stock" },
      { display_id: "PRD-004", name: "Standard Consumable Item D", sku: "GEN-CS-04", category: "General", purchase_price: 25, price: 70, stock: 150, status: "Active" },
      { display_id: "PRD-005", name: "Utility Support Pack E", sku: "GEN-UT-05", category: "Services", purchase_price: 80, price: 180, stock: 75, status: "Active" }
    ],
    orders: [
      { display_id: "ORD-9012", customer: "Client Alpha", date: "13 May 2026, 10:45 AM", amount: "₹680", payment: "Paid", status: "New", address: "Tech Hub Street, Sector 1, Bangalore", phone: "+91 90000 11111", items: [{ name: "Standard Consumable Item D", qty: 4, price: "₹70" }, { name: "Premium Merchandise Unit A", qty: 1, price: "₹250" }] },
      { display_id: "ORD-9011", customer: "Client Beta", date: "13 May 2026, 09:15 AM", amount: "₹1,500", payment: "Paid", status: "Packed", address: "Business Tower, Road No 5, Pune", phone: "+91 90000 22222", items: [{ name: "Specialized Service Item B", qty: 10, price: "₹150" }] },
      { display_id: "ORD-9010", customer: "Client Gamma", date: "12 May 2026, 04:30 PM", amount: "₹1,800", payment: "COD", status: "Shipped", address: "Outer Ring Road, Block C, Chennai", phone: "+91 90000 33333", items: [{ name: "Utility Support Pack E", qty: 10, price: "₹180" }] }
    ],
    expenses: [
      { display_id: "EXP-900", category: "Office Supplies", amount: 5000, notes: "Corporate operating utilities", date: new Date().toISOString() },
      { display_id: "EXP-899", category: "Marketing", amount: 10000, notes: "Digital audience and lead acquisition", date: new Date(Date.now() - 86400000).toISOString() },
      { display_id: "EXP-898", category: "Other", amount: 3500, notes: "Administrative overhead adjustments", date: new Date(Date.now() - 172800000).toISOString() }
    ]
  },
  helperText: [
    { key: "searchProducts", text: "Search catalog by name, index or SKU..." },
    { key: "searchSales", text: "Search by client name, transaction # or status..." },
    { key: "searchCustomers", text: "Search by client name, email or reference..." },
    { key: "companyNameLabel", text: "Organization Name" },
    { key: "gstInLabel", text: "Business ID Code" },
    { key: "returnAddressLabel", text: "Corporate Hub Address" }
  ]
};
