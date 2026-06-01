export const ClinicConfig = {
  sidebar: [
    { name: "Dashboard", label: "Dashboard" },
    { name: "Customers", label: "Patients" },
    { name: "Appointments", label: "Appointments" },
    { name: "Sales", label: "Billing" },
    { name: "Inventory", label: "Inventory" },
    { name: "Expenses", label: "Expenses" },
    { name: "Reports", label: "Reports" },
    { name: "Settings", label: "Settings" }
  ],
  dashboardCards: [
    { key: "Patients Today", title: "Patients Today" },
    { key: "New Patients", title: "New Patients" },
    { key: "Follow-Ups Due", title: "Follow-Ups Due" },
    { key: "Appointments Today", title: "Appointments Today" },
    { key: "Revenue Today", title: "Revenue Today" },
    { key: "Revenue This Month", title: "Revenue This Month" },
    { key: "Pending Payments", title: "Pending Payments" },
    { key: "Low Stock Items", title: "Low Stock Items" }
  ],
  chartLabels: [
    { key: "revenueTrend", label: "Clinic Revenue Trend" },
    { key: "patientGrowth", label: "Patient Growth Trend" },
    { key: "appointmentPerformance", label: "Appointment Analytics" }
  ],
  modules: [
    { 
      key: "Customers", 
      displayName: "Patients", 
      singularDisplayName: "Patient", 
      description: "Manage patient records, prescriptions, and visit histories.", 
      emptyStateText: "No patient records registered yet." 
    },
    { 
      key: "Appointments", 
      displayName: "Appointments", 
      singularDisplayName: "Appointment", 
      description: "Manage clinic queue, schedules, and follow-ups.", 
      emptyStateText: "No appointments scheduled." 
    },
    { 
      key: "Sales", 
      displayName: "Billing", 
      singularDisplayName: "Invoice", 
      description: "Manage clinic revenue, consultation fees, and payments.", 
      emptyStateText: "No invoices generated yet." 
    },
    { 
      key: "Inventory", 
      displayName: "Inventory", 
      singularDisplayName: "Item", 
      description: "Manage medicines, consumables, and clinic supplies.", 
      emptyStateText: "No inventory items configured." 
    },
    { 
      key: "Expenses", 
      displayName: "Expenses", 
      singularDisplayName: "Expense", 
      description: "Track clinic operating expenses like rent, salaries, and lab charges.", 
      emptyStateText: "No expenses logged yet." 
    }
  ],
  sampleData: {
    products: [
      { display_id: "MED-001", name: "Paracetamol 500mg", sku: "MED-PAR-500", category: "Medicines", purchase_price: 15, price: 30, stock: 450, status: "Active" },
      { display_id: "MED-002", name: "Amoxicillin 250mg", sku: "MED-AMX-250", category: "Medicines", purchase_price: 45, price: 80, stock: 120, status: "Active" },
      { display_id: "CON-001", name: "Syringes 5ml", sku: "CON-SYR-05", category: "Consumables", purchase_price: 5, price: 10, stock: 1500, status: "Active" },
      { display_id: "CON-002", name: "Cotton Rolls", sku: "CON-COT-01", category: "Clinic Supplies", purchase_price: 50, price: 100, stock: 20, status: "Active" },
      { display_id: "SUP-001", name: "Multivitamin Gummies", sku: "SUP-MUL-01", category: "Supplements", purchase_price: 200, price: 450, stock: 45, status: "Active" }
    ],
    orders: [
      { display_id: "INV-1001", customer: "Rajesh Kumar", date: new Date().toISOString(), amount: "₹850", payment: "Paid", status: "Completed", address: "Sunrise Clinic", phone: "+91 98765 12345", items: [{ name: "General Consultation", qty: 1, price: "₹500" }, { name: "Paracetamol 500mg", qty: 2, price: "₹30" }] },
      { display_id: "INV-1002", customer: "Sneha Patel", date: new Date(Date.now() - 3600000).toISOString(), amount: "₹1,200", payment: "Pending", status: "Pending", address: "Sunrise Clinic", phone: "+91 99887 76655", items: [{ name: "Specialist Consultation", qty: 1, price: "₹1200" }] }
    ],
    expenses: [
      { display_id: "EXP-801", category: "Rent", amount: 45000, notes: "Clinic Premises Monthly Lease", date: new Date().toISOString() },
      { display_id: "EXP-802", category: "Salaries", amount: 65000, notes: "Nurses & Staff Payroll", date: new Date().toISOString() },
      { display_id: "EXP-803", category: "Lab Charges", amount: 12500, notes: "External Lab Testing Fees", date: new Date().toISOString() }
    ]
  },
  helperText: [
    { key: "searchProducts", text: "Search inventory by medicine name or batch..." },
    { key: "searchSales", text: "Search invoices by patient name or invoice #..." },
    { key: "searchCustomers", text: "Search patients by name, mobile or ID..." },
    { key: "companyNameLabel", text: "Clinic Name" },
    { key: "gstInLabel", text: "Clinic GSTIN / Reg No." },
    { key: "returnAddressLabel", text: "Clinic Registered Address" }
  ]
};
