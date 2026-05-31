export const GymServicesConfig = {
  sidebar: [
    { name: "Dashboard", label: "Dashboard" },
    { name: "Customers", label: "Members" },
    { name: "Inventory", label: "Memberships" },
    { name: "Supplements", label: "Supplements & Products" },
    { name: "Attendance", label: "Attendance" },
    { name: "Sales", label: "Revenue" },
    { name: "Expenses", label: "Expenses" },
    { name: "Reports", label: "Reports" },
    { name: "Goals", label: "Goals" },
    { name: "Settings", label: "Settings" }
  ],
  dashboardCards: [
    { key: "Total Members", title: "Total Members" },
    { key: "Active Members", title: "Active Members" },
    { key: "New Leads", title: "New Leads" },
    { key: "Renewals Due", title: "Renewals Due" },
    { key: "Revenue Today", title: "Revenue Today" },
    { key: "Revenue This Month", title: "Revenue This Month" },
    { key: "PT Revenue", title: "PT Revenue" },
    { key: "Product Revenue", title: "Product Revenue" },
    { key: "Attendance Today", title: "Attendance Today" }
  ],
  chartLabels: [
    { key: "revenueTrend", label: "Gym Revenue Trend" },
    { key: "membershipGrowth", label: "Member Acquisition Growth" },
    { key: "renewalPerformance", label: "Renewal Conversion Rate" }
  ],
  modules: [
    { 
      key: "Inventory", 
      displayName: "Memberships", 
      singularDisplayName: "Membership Plan", 
      description: "Manage subscription plans, personal coaching rates, and packaging metrics.", 
      emptyStateText: "No gym plans or PT packages configured yet." 
    },
    { 
      key: "Sales", 
      displayName: "Revenue", 
      singularDisplayName: "Transaction", 
      description: "Track memberships checkout receipts, personal training invoices, and store sales.", 
      emptyStateText: "No sales or receipts logged yet today." 
    },
    { 
      key: "Customers", 
      displayName: "Members", 
      singularDisplayName: "Member", 
      description: "Manage physical fitness studio members, access pass durations, and coaching assignments.", 
      emptyStateText: "No studio members registered yet." 
    },
    { 
      key: "Expenses", 
      displayName: "Expenses", 
      singularDisplayName: "Gym Expense", 
      description: "Manage studio rent, salaries, utilities, and equipment lease costs.", 
      emptyStateText: "No gym expenses logged yet." 
    },
    { 
      key: "Goals", 
      displayName: "Goals", 
      singularDisplayName: "Goal Target", 
      description: "Track monthly targets for revenue, membership growth, and trainer metrics.", 
      emptyStateText: "No gym service operational goals set for this month." 
    }
  ],
  sampleData: {
    products: [
      { display_id: "GYM-PLN-01", name: "Monthly Plan", sku: "GYM-MON-01", category: "Membership Plans", purchase_price: 0, price: 2999, stock: 999, status: "Active" },
      { display_id: "GYM-PLN-02", name: "Quarterly Plan", sku: "GYM-QTR-02", category: "Membership Plans", purchase_price: 0, price: 7999, stock: 999, status: "Active" },
      { display_id: "GYM-PLN-03", name: "Half Yearly", sku: "GYM-HLY-03", category: "Membership Plans", purchase_price: 0, price: 13999, stock: 999, status: "Active" },
      { display_id: "GYM-PLN-04", name: "Annual Plan", sku: "GYM-ANN-04", category: "Membership Plans", purchase_price: 0, price: 24999, stock: 999, status: "Active" },
      { display_id: "GYM-PLN-05", name: "Personal Training", sku: "GYM-PT-05", category: "PT & Special", purchase_price: 0, price: 12000, stock: 999, status: "Active" },
      { display_id: "GYM-PLN-06", name: "Weight Loss Program", sku: "GYM-WLP-06", category: "PT & Special", purchase_price: 0, price: 18000, stock: 999, status: "Active" }
    ],
    orders: [
      { display_id: "REC-1001", customer: "Aarav Mehta", date: "31 May 2026, 08:30 AM", amount: "₹24,999", payment: "Paid", status: "Delivered", address: "Elite Fitness Studio Main Branch", phone: "+91 99887 76655", items: [{ name: "Annual Plan", qty: 1, price: "₹24999" }] },
      { display_id: "REC-1002", customer: "Rohan Sharma", date: "30 May 2026, 07:15 PM", amount: "₹12,000", payment: "Paid", status: "Delivered", address: "Elite Fitness Studio Main Branch", phone: "+91 98765 43210", items: [{ name: "Personal Training", qty: 1, price: "₹12000" }] },
      { display_id: "REC-1003", customer: "Priya Patel", date: "30 May 2026, 05:40 PM", amount: "₹3,299", payment: "Paid", status: "Delivered", address: "Elite Fitness Studio Main Branch", phone: "+91 91234 56789", items: [{ name: "Whey Protein", qty: 1, price: "₹2999" }, { name: "Shaker", qty: 1, price: "₹300" }] }
    ],
    expenses: [
      { display_id: "EXP-801", category: "Rent", amount: 120000, notes: "Studio Space Monthly Lease", date: new Date().toISOString() },
      { display_id: "EXP-802", category: "Salaries", amount: 80000, notes: "Trainers & Front Desk Payroll", date: new Date().toISOString() },
      { display_id: "EXP-803", category: "Equipment", amount: 35000, notes: "Spin Bikes Lease & Treadmill AMC", date: new Date().toISOString() }
    ]
  },
  helperText: [
    { key: "searchProducts", text: "Search membership plans by name, code or category..." },
    { key: "searchSales", text: "Search transactions by member, receipt # or status..." },
    { key: "searchCustomers", text: "Search members by name, email, mobile or ID..." },
    { key: "companyNameLabel", text: "Fitness Studio Brand" },
    { key: "gstInLabel", text: "Studio GSTIN Registry ID" },
    { key: "returnAddressLabel", text: "Studio Registered Address" }
  ]
};
