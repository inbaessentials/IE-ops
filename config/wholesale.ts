export const WholesaleConfig = {
  sidebar: [
    { name: "Dashboard", label: "Dashboard" },
    { name: "Inventory", label: "Stock" },
    { name: "Sales", label: "Orders" },
    { name: "Purchases", label: "Supplier Purchases" },
    { name: "Returns", label: "Returns" },
    { name: "Expenses", label: "Expenses" },
    { name: "Customers", label: "Dealers" },
    { name: "Reports", label: "Reports" },
    { name: "Goals", label: "Revenue Goals" },
    { name: "Settings", label: "Settings" }
  ],
  dashboardCards: [
    { key: "Total Sales", title: "Wholesale Sales" },
    { key: "Total Items Sold", title: "Bulk Units Shipped" },
    { key: "Net Profit", title: "Net Profit" },
    { key: "Margin (% Gained)", title: "Trade Margin" },
    { key: "Avg Order Value (AOV)", title: "Avg Invoice Value" },
    { key: "Pending Packing", title: "Pending Dispatch" },
    { key: "Low Stock Items", title: "Critical Stock Alerts" },
    { key: "Total Expenses", title: "Overhead Expenses" }
  ],
  chartLabels: [
    { key: "salesTrend", label: "Order Volume Trend (Last 7 Days)" },
    { key: "categoryShare", label: "Bulk Category Share (Sales)" },
    { key: "expenseBreakdown", label: "Supply Chain Expense Breakdown" }
  ],
  modules: [
    { 
      key: "Inventory", 
      displayName: "Stock", 
      singularDisplayName: "Stock Item", 
      description: "Manage wholesale warehouses, bulk stocks, pallets, and SKU lists.", 
      emptyStateText: "No wholesale stock items registered." 
    },
    { 
      key: "Sales", 
      displayName: "Orders", 
      singularDisplayName: "Order", 
      description: "Manage commercial dealer bulk invoices, payment terms, and dispatch schedules.", 
      emptyStateText: "No wholesale invoices recorded yet." 
    },
    { 
      key: "Customers", 
      displayName: "Dealers", 
      singularDisplayName: "Dealer", 
      description: "Manage B2B dealer listings, commercial franchises, and credit terms.", 
      emptyStateText: "No registered dealers in the directory." 
    },
    { 
      key: "Purchases", 
      displayName: "Supplier Purchases", 
      singularDisplayName: "Supply Purchase", 
      description: "Manage primary raw materials and bulk acquisitions from factories.", 
      emptyStateText: "No supply purchases registered yet." 
    },
    { 
      key: "Returns", 
      displayName: "Returns", 
      singularDisplayName: "Return", 
      description: "Process cargo claims, supply damages, and return logs.", 
      emptyStateText: "No return claims submitted yet." 
    },
    { 
      key: "Expenses", 
      displayName: "Expenses", 
      singularDisplayName: "Expense", 
      description: "Track logistics, machinery fuel, warehouse rent, and licensing expenses.", 
      emptyStateText: "No expenses recorded yet." 
    },
    { 
      key: "Goals", 
      displayName: "Revenue Goals", 
      singularDisplayName: "Revenue Target", 
      description: "Define and monitor monthly wholesale commercial revenue targets.", 
      emptyStateText: "No trade revenue targets set for this month." 
    }
  ],
  sampleData: {
    products: [
      { display_id: "PRD-001", name: "Bulk Cardboard Shipping Boxes (Pack of 100)", sku: "WHL-CB-100", category: "Packaging", purchase_price: 450, price: 999, stock: 450, status: "Active" },
      { display_id: "PRD-002", name: "Industrial Heavy Duty Safety Gloves (Box of 50)", sku: "WHL-SG-50", category: "Safety", purchase_price: 800, price: 1799, stock: 15, status: "Low Stock" },
      { display_id: "PRD-003", name: "Heavy Duty Biodegradable Packing Tape (Roll of 20)", sku: "WHL-PT-20", category: "Packaging", purchase_price: 600, price: 1299, stock: 0, status: "Out of Stock" },
      { display_id: "PRD-004", name: "Heat-Treated Standard Wooden Pallets", sku: "WHL-WP-01", category: "Logistics", purchase_price: 700, price: 1500, stock: 95, status: "Active" },
      { display_id: "PRD-005", name: "Anti-Static Bubble Wrap Rolls (100m)", sku: "WHL-BW-100", category: "Packaging", purchase_price: 400, price: 950, stock: 180, status: "Active" }
    ],
    orders: [
      { display_id: "ORD-9012", customer: "Erode Agrochemicals", date: "13 May 2026, 10:45 AM", amount: "₹18,900", payment: "Paid", status: "New", address: "Commercial Area, Moolapalayam, Erode", phone: "+91 99887 76655", items: [{ name: "Anti-Static Bubble Wrap Rolls (100m)", qty: 10, price: "₹950" }, { name: "Bulk Cardboard Shipping Boxes (Pack of 100)", qty: 9, price: "₹999" }] },
      { display_id: "ORD-9011", customer: "Tirupur Garments Corp", date: "13 May 2026, 09:15 AM", amount: "₹45,000", payment: "COD", status: "Packed", address: "Avinashi Road, Tirupur, TN", phone: "+91 99887 88990", items: [{ name: "Heat-Treated Standard Wooden Pallets", qty: 30, price: "₹1500" }] },
      { display_id: "ORD-9010", customer: "Salem Steel Traders", date: "12 May 2026, 04:30 PM", amount: "₹8,995", payment: "Paid", status: "Shipped", address: "Iron Market, Salem Bypass, Salem", phone: "+91 99887 11223", items: [{ name: "Industrial Heavy Duty Safety Gloves (Box of 50)", qty: 5, price: "₹1799" }] }
    ],
    expenses: [
      { display_id: "EXP-900", category: "Logistics", amount: 12500, notes: "Freight trucking delivery charges", date: new Date().toISOString() },
      { display_id: "EXP-899", category: "Office Supplies", amount: 6500, notes: "Warehouse forklift battery & maintenance", date: new Date(Date.now() - 86400000).toISOString() },
      { display_id: "EXP-898", category: "Other", amount: 18000, notes: "Monthly warehouse floor lease payment", date: new Date(Date.now() - 172800000).toISOString() }
    ]
  },
  helperText: [
    { key: "searchProducts", text: "Search bulk stock by SKU, warehouse shelf or name..." },
    { key: "searchSales", text: "Search by dealer name, invoice # or status..." },
    { key: "searchCustomers", text: "Search by dealer name, registration code or phone..." },
    { key: "companyNameLabel", text: "Enterprise Entity Name" },
    { key: "gstInLabel", text: "Enterprise GSTIN" },
    { key: "returnAddressLabel", text: "Distribution Warehouse Address" }
  ]
};
