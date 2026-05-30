export const InbaConfig = {
  sidebar: [
    { name: "Dashboard", label: "Dashboard" },
    { name: "Inventory", label: "Inventory" },
    { name: "Sales", label: "Sales" },
    { name: "Purchases", label: "Purchases" },
    { name: "Returns", label: "Returns" },
    { name: "Expenses", label: "Expenses" },
    { name: "Customers", label: "Customers" },
    { name: "Reports", label: "Reports" },
    { name: "Goals", label: "Goals" },
    { name: "Settings", label: "Settings" }
  ],
  dashboardCards: [
    { key: "Total Sales", title: "Total Sales" },
    { key: "Total Items Sold", title: "Total Items Sold" },
    { key: "Net Profit", title: "Net Profit" },
    { key: "Margin (% Gained)", title: "Margin (% Gained)" },
    { key: "Avg Order Value (AOV)", title: "Avg Order Value (AOV)" },
    { key: "Pending Packing", title: "Pending Packing" },
    { key: "Low Stock Items", title: "Low Stock Items" },
    { key: "Total Expenses", title: "Total Expenses" }
  ],
  chartLabels: [
    { key: "salesTrend", label: "Sales Trend (Last 7 Days)" },
    { key: "categoryShare", label: "Category Share (Sales)" },
    { key: "expenseBreakdown", label: "Expense Breakdown" }
  ],
  modules: [
    { 
      key: "Inventory", 
      displayName: "Inventory", 
      singularDisplayName: "Product", 
      description: "Manage your products, stock levels, and variants.", 
      emptyStateText: "No products found." 
    },
    { 
      key: "Sales", 
      displayName: "Sales", 
      singularDisplayName: "Order", 
      description: "Manage your sales orders, customer details and payment status.", 
      emptyStateText: "No sales orders recorded yet." 
    },
    { 
      key: "Customers", 
      displayName: "Customers", 
      singularDisplayName: "Customer", 
      description: "Manage your customer contact details and transaction history.", 
      emptyStateText: "No customers in your directory yet." 
    },
    { 
      key: "Purchases", 
      displayName: "Purchases", 
      singularDisplayName: "Purchase", 
      description: "Track items purchased from external suppliers.", 
      emptyStateText: "No purchases registered yet." 
    },
    { 
      key: "Returns", 
      displayName: "Returns", 
      singularDisplayName: "Return", 
      description: "Process return requests and refunds.", 
      emptyStateText: "No returns requested yet." 
    },
    { 
      key: "Expenses", 
      displayName: "Expenses", 
      singularDisplayName: "Expense", 
      description: "Track your business operating expenses.", 
      emptyStateText: "No expenses recorded yet." 
    },
    { 
      key: "Goals", 
      displayName: "Goals", 
      singularDisplayName: "Goal", 
      description: "Define and monitor monthly targets.", 
      emptyStateText: "No targets set for this month." 
    }
  ],
  sampleData: {
    products: [
      { display_id: "PRD-001", name: "Herbal Hair Oil (200ml)", sku: "HB-HO-200", category: "Herbal", purchase_price: 150, price: 299, stock: 145, status: "Active" },
      { display_id: "PRD-002", name: "Aloe Vera Face Wash", sku: "CM-AV-100", category: "Cosmetic", purchase_price: 80, price: 199, stock: 12, status: "Low Stock" },
      { display_id: "PRD-003", name: "Organic Honey (500g)", sku: "GR-OH-500", category: "Grocery", purchase_price: 300, price: 450, stock: 0, status: "Out of Stock" },
      { display_id: "PRD-004", name: "Neem Soap Bar", sku: "HB-NS-1", category: "Wellness", purchase_price: 30, price: 75, stock: 320, status: "Active" },
      { display_id: "PRD-005", name: "Rose Water Spray", sku: "BT-RW-50", category: "Beauty", purchase_price: 50, price: 120, stock: 85, status: "Active" }
    ],
    orders: [
      { display_id: "ORD-9012", customer: "Rahul Sharma", date: "13 May 2026, 10:45 AM", amount: "₹890", payment: "Paid", status: "New", address: "123 Anna Salai, Chennai", phone: "+91 98765 43210", items: [{ name: "Herbal Hair Oil (200ml)", qty: 2, price: "₹299" }, { name: "Neem Soap Bar", qty: 4, price: "₹75" }] },
      { display_id: "ORD-9011", customer: "Priya Patel", date: "13 May 2026, 09:15 AM", amount: "₹1,450", payment: "COD", status: "Packed", address: "45 MG Road, Bangalore", phone: "+91 98765 43211", items: [{ name: "Organic Honey (500g)", qty: 3, price: "₹450" }] },
      { display_id: "ORD-9010", customer: "Anil Kumar", date: "12 May 2026, 04:30 PM", amount: "₹340", payment: "Paid", status: "Shipped", address: "89 Jubilee Hills, Hyderabad", phone: "+91 98765 43212", items: [{ name: "Rose Water Spray", qty: 2, price: "₹120" }, { name: "Aloe Vera Face Wash", qty: 1, price: "₹100" }] }
    ],
    expenses: [
      { display_id: "EXP-900", category: "Office Supplies", amount: 2500, notes: "Printer ink and paper", date: new Date().toISOString() },
      { display_id: "EXP-899", category: "Marketing", amount: 15000, notes: "Facebook Ads - Diwali Campaign", date: new Date(Date.now() - 86400000).toISOString() },
      { display_id: "EXP-898", category: "Logistics", amount: 450, notes: "Delhivery Shipping charges", date: new Date(Date.now() - 172800000).toISOString() }
    ]
  },
  helperText: [
    { key: "searchProducts", text: "Search products by name or SKU..." },
    { key: "searchSales", text: "Search by customer name, order # or status..." },
    { key: "searchCustomers", text: "Search by customer name, email or phone..." },
    { key: "companyNameLabel", text: "Company Name" },
    { key: "gstInLabel", text: "GST / Tax ID" },
    { key: "returnAddressLabel", text: "Official Return Address" }
  ]
};
