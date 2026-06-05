export const OnlineCourseConfig = {
  sidebar: [
    { name: "Dashboard", label: "Dashboard" },
    { name: "Inventory", label: "Courses" },
    { name: "Sales", label: "Enrollments" },
    { name: "Leads", label: "Lead CRM" },
    // { name: "Followups", label: "Follow-up Center" },
    // { name: "Purchases", label: "Marketing Spend" },
    { name: "Returns", label: "Refunds" },
    { name: "Expenses", label: "Expenses" }, // Retain original module key
    { name: "Customers", label: "Students" },
    { name: "Team", label: "Team Directory" },
    { name: "Reports", label: "Reports" },
    { name: "Goals", label: "Enrollment Goals" },
    { name: "Settings", label: "Settings" }
  ],
  dashboardCards: [
    { key: "Total Sales", title: "Total Revenue" },
    { key: "Total Items Sold", title: "Total Students" },
    { key: "Net Profit", title: "Net Profit" },
    { key: "Margin (% Gained)", title: "Conversion Rate" },
    { key: "Avg Order Value (AOV)", title: "New Enrollments" },
    { key: "Pending Packing", title: "Pending Follow-ups" },
    { key: "Low Stock Items", title: "Refund Requests" },
    { key: "Total Expenses", title: "Marketing Spend" }
  ],
  chartLabels: [
    { key: "salesTrend", label: "Enrollment Trend (Last 7 Days)" },
    { key: "categoryShare", label: "Subject Category Share (Sales)" },
    { key: "expenseBreakdown", label: "Marketing & Dev Costs Breakdown" }
  ],
  modules: [
    { 
      key: "Inventory", 
      displayName: "Courses", 
      singularDisplayName: "Course", 
      description: "Manage your educational curriculum, bootcamps, and catalog items.", 
      emptyStateText: "No courses or bootcamps published yet." 
    },
    { 
      key: "Sales", 
      displayName: "Enrollments", 
      singularDisplayName: "Enrollment", 
      description: "Manage student course purchases, subscription billings, and payment statuses.", 
      emptyStateText: "No course enrollments recorded yet." 
    },
    { 
      key: "Customers", 
      displayName: "Students", 
      singularDisplayName: "Student", 
      description: "Manage registered students, learning status, and contact directory.", 
      emptyStateText: "No students registered in the academy yet." 
    },
    { 
      key: "Purchases", 
      displayName: "Marketing Spend", 
      singularDisplayName: "Marketing Campaign", 
      description: "Track your advertising budgets, campaigns, leads, and acquisition costs.", 
      emptyStateText: "No marketing campaigns registered yet." 
    },
    { 
      key: "Returns", 
      displayName: "Refunds", 
      singularDisplayName: "Refund Request", 
      description: "Process student satisfaction claims and refund requests.", 
      emptyStateText: "No refund requests submitted yet." 
    },
    { 
      key: "Expenses", 
      displayName: "Expenses", 
      singularDisplayName: "Cost Item", 
      description: "Track video hosting, platform licensing, and developer costs.", 
      emptyStateText: "No expenses recorded yet." 
    },
    { 
      key: "Goals", 
      displayName: "Enrollment Goals", 
      singularDisplayName: "Enrollment Target", 
      description: "Define and monitor monthly revenue, student acquisition, and course target outcomes.", 
      emptyStateText: "No cohort enrollment targets defined for this month." 
    }
  ],
  sampleData: {
    products: [
      { display_id: "PRD-001", name: "UI/UX Bootcamp", sku: "LMS-UX-01", category: "Design", purchase_price: 500, price: 4999, stock: 150, status: "Active" },
      { display_id: "PRD-002", name: "AI for Business Masterclass", sku: "LMS-AI-02", category: "Coding", purchase_price: 300, price: 3999, stock: 88, status: "Active" },
      { display_id: "PRD-003", name: "Digital Marketing Masterclass", sku: "LMS-DM-03", category: "Marketing", purchase_price: 200, price: 1999, stock: 240, status: "Active" },
      { display_id: "PRD-004", name: "Spoken English Program", sku: "LMS-ENG-04", category: "Language", purchase_price: 150, price: 1299, stock: 8, status: "Low Stock" }
    ],
    orders: [
      { display_id: "ORD-9012", customer: "Kabir Gupta", date: "13 May 2026, 10:45 AM", amount: "₹6,298", payment: "Paid", status: "New", address: "Flat 405, Sector 62, Noida", phone: "+91 98765 11122", items: [{ name: "Spoken English Program", qty: 1, price: "₹1299" }, { name: "UI/UX Bootcamp", qty: 1, price: "₹4999" }] },
      { display_id: "ORD-9011", customer: "Meera Reddy", date: "13 May 2026, 09:15 AM", amount: "₹3,999", payment: "Paid", status: "Packed", address: "Plot 24, Gachibowli, Hyderabad", phone: "+91 98765 22233", items: [{ name: "AI for Business Masterclass", qty: 1, price: "₹3999" }] },
      { display_id: "ORD-9010", customer: "Sanjay Dutt", date: "12 May 2026, 04:30 PM", amount: "₹1,999", payment: "Paid", status: "Shipped", address: "B/502, Carter Road, Bandra West, Mumbai", phone: "+91 98765 33344", items: [{ name: "Digital Marketing Masterclass", qty: 1, price: "₹1999" }] }
    ],
    expenses: [
      { display_id: "EXP-900", category: "Marketing", amount: 15000, notes: "Meta Ads campaign (Fictional Academy Acquisition)", date: new Date().toISOString() },
      { display_id: "EXP-899", category: "Marketing", amount: 12000, notes: "Google Search Ads campaign", date: new Date(Date.now() - 86400000).toISOString() },
      { display_id: "EXP-898", category: "Technology", amount: 8000, notes: "AWS Video Stream Hosting Subscription", date: new Date(Date.now() - 172800000).toISOString() }
    ]
  },
  helperText: [
    { key: "searchProducts", text: "Search courses by title, code or category..." },
    { key: "searchSales", text: "Search by student name, enrollment # or status..." },
    { key: "searchCustomers", text: "Search by student name, email or mobile..." },
    { key: "companyNameLabel", text: "Academy Brand Name" },
    { key: "gstInLabel", text: "Academy Tax Registration ID" },
    { key: "returnAddressLabel", text: "Academy Registered Address" }
  ]
};
