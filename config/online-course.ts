export const OnlineCourseConfig = {
  sidebar: [
    { name: "Dashboard", label: "Dashboard" },
    { name: "Inventory", label: "Courses" },
    { name: "Sales", label: "Enrollments" },
    { name: "Purchases", label: "Marketing Spend" },
    { name: "Returns", label: "Refunds" },
    { name: "Expenses", label: "Operating Costs" },
    { name: "Customers", label: "Students" },
    { name: "Reports", label: "Reports" },
    { name: "Goals", label: "Enrollment Goals" },
    { name: "Settings", label: "Settings" }
  ],
  dashboardCards: [
    { key: "Total Sales", title: "Total Billings" },
    { key: "Total Items Sold", title: "Course Enrollments" },
    { key: "Net Profit", title: "Net Earnings" },
    { key: "Margin (% Gained)", title: "Operating Margin" },
    { key: "Avg Order Value (AOV)", title: "Avg Course Sale (ACS)" },
    { key: "Pending Packing", title: "Pending Activations" },
    { key: "Low Stock Items", title: "Low Engagement Courses" },
    { key: "Total Expenses", title: "Total Spending" }
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
      description: "Manage your educational curriculum, lectures, authors, and enrollments.", 
      emptyStateText: "No courses or bootcamps published yet." 
    },
    { 
      key: "Sales", 
      displayName: "Enrollments", 
      singularDisplayName: "Enrollment", 
      description: "Manage your student course purchases, subscription billing, and activation status.", 
      emptyStateText: "No course enrollments recorded yet." 
    },
    { 
      key: "Customers", 
      displayName: "Students", 
      singularDisplayName: "Student", 
      description: "Manage your registered students, learning progress, and contact details.", 
      emptyStateText: "No students registered in the academy yet." 
    },
    { 
      key: "Purchases", 
      displayName: "Marketing Spend", 
      singularDisplayName: "Ad Campaign", 
      description: "Track your customer acquisition cost, ad budget, and marketing spend.", 
      emptyStateText: "No marketing campaigns registered yet." 
    },
    { 
      key: "Returns", 
      displayName: "Refunds", 
      singularDisplayName: "Refund", 
      description: "Process student course refund requests and course satisfaction dropouts.", 
      emptyStateText: "No refund requests submitted yet." 
    },
    { 
      key: "Expenses", 
      displayName: "Expenses", 
      singularDisplayName: "Cost Item", 
      description: "Track platform infrastructure, video hosting, and instructor payouts.", 
      emptyStateText: "No expenses recorded yet." 
    },
    { 
      key: "Goals", 
      displayName: "Enrollment Goals", 
      singularDisplayName: "Enrollment Target", 
      description: "Define and monitor cohort-specific student enrollment goals.", 
      emptyStateText: "No cohort enrollment goals defined for this batch." 
    }
  ],
  sampleData: {
    products: [
      { display_id: "PRD-001", name: "Full-Stack Web Development Bootcamp", sku: "LMS-FS-01", category: "Coding", purchase_price: 500, price: 4999, stock: 150, status: "Active" },
      { display_id: "PRD-002", name: "UI/UX Design Masterclass (Figma)", sku: "LMS-UI-02", category: "Design", purchase_price: 300, price: 2999, stock: 8, status: "Low Stock" },
      { display_id: "PRD-003", name: "Python for Data Science & AI", sku: "LMS-PY-03", category: "Coding", purchase_price: 800, price: 3999, stock: 0, status: "Out of Stock" },
      { display_id: "PRD-004", name: "Digital Marketing Blueprint 2026", sku: "LMS-DM-04", category: "Business", purchase_price: 200, price: 1999, stock: 240, status: "Active" },
      { display_id: "PRD-005", name: "Intro to LLMs & ChatGPT API", sku: "LMS-AI-05", category: "Wellness", purchase_price: 150, price: 1299, stock: 88, status: "Active" }
    ],
    orders: [
      { display_id: "ORD-9012", customer: "Kabir Gupta", date: "13 May 2026, 10:45 AM", amount: "₹6,298", payment: "Paid", status: "New", address: "Flat 405, Sector 62, Noida", phone: "+91 98765 11122", items: [{ name: "Intro to LLMs & ChatGPT API", qty: 1, price: "₹1299" }, { name: "Full-Stack Web Development Bootcamp", qty: 1, price: "₹4999" }] },
      { display_id: "ORD-9011", customer: "Meera Reddy", date: "13 May 2026, 09:15 AM", amount: "₹2,999", payment: "Paid", status: "Packed", address: "Plot 24, Gachibowli, Hyderabad", phone: "+91 98765 22233", items: [{ name: "UI/UX Design Masterclass (Figma)", qty: 1, price: "₹2999" }] },
      { display_id: "ORD-9010", customer: "Sanjay Dutt", date: "12 May 2026, 04:30 PM", amount: "₹1,999", payment: "Paid", status: "Shipped", address: "B/502, Carter Road, Bandra West, Mumbai", phone: "+91 98765 33344", items: [{ name: "Digital Marketing Blueprint 2026", qty: 1, price: "₹1999" }] }
    ],
    expenses: [
      { display_id: "EXP-900", category: "Technology", amount: 8000, notes: "AWS Cloud & Video Streaming server subscription", date: new Date().toISOString() },
      { display_id: "EXP-899", category: "Marketing", amount: 25000, notes: "Google Search Ads & Retargeting campaign", date: new Date(Date.now() - 86400000).toISOString() },
      { display_id: "EXP-898", category: "Other", amount: 12000, notes: "Instructor royalties payout (April Cohort)", date: new Date(Date.now() - 172800000).toISOString() }
    ]
  },
  helperText: [
    { key: "searchProducts", text: "Search courses by title, code or category..." },
    { key: "searchSales", text: "Search by student name, enrollment # or status..." },
    { key: "searchCustomers", text: "Search by student name, email or mobile..." },
    { key: "companyNameLabel", text: "Academy Name" },
    { key: "gstInLabel", text: "Tax Registration ID" },
    { key: "returnAddressLabel", text: "Academy Registered Address" }
  ]
};
