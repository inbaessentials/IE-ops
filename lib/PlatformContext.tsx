"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import { getPlatformConfig, PlatformConfig, BusinessPlatform } from "@/config";

// Gym Seeder function
const seedGymData = () => {
  if (typeof window === "undefined" || localStorage.getItem("inba_gym_seeded") === "true") return;

  const plans = [
    { id: "GYM-PLN-01", name: "Monthly Plan", duration: "1 Month", price: 2999, gst: 18, freezeAllowed: true, status: "Active" },
    { id: "GYM-PLN-02", name: "Quarterly Plan", duration: "3 Months", price: 7999, gst: 18, freezeAllowed: true, status: "Active" },
    { id: "GYM-PLN-03", name: "Half Yearly", duration: "6 Months", price: 13999, gst: 18, freezeAllowed: true, status: "Active" },
    { id: "GYM-PLN-04", name: "Annual Plan", duration: "12 Months", price: 24999, gst: 18, freezeAllowed: true, status: "Active" },
    { id: "GYM-PLN-05", name: "Personal Training", duration: "1 Month (12 Sessions)", price: 12000, gst: 18, freezeAllowed: false, status: "Active" },
    { id: "GYM-PLN-06", name: "Weight Loss Program", duration: "3 Months (36 Sessions)", price: 18000, gst: 18, freezeAllowed: true, status: "Active" }
  ];
  localStorage.setItem("inba_gym_memberships", JSON.stringify(plans));

  const trainers = [
    { id: "TRN-01", name: "Rajveer Singh", activeClients: 12, ptSales: 8, revenue: 144000, rating: 4.9, bio: "Strength & Conditioning Coach" },
    { id: "TRN-02", name: "Meenakshi Sen", activeClients: 8, ptSales: 5, revenue: 96000, rating: 4.8, bio: "Certified Nutritionist & Weight Loss Specialist" },
    { id: "TRN-03", name: "Vikram Malhotra", activeClients: 6, ptSales: 3, revenue: 54000, rating: 4.7, bio: "Functional Training & Pilates" },
    { id: "TRN-04", name: "Siddharth Roy", activeClients: 9, ptSales: 6, revenue: 108000, rating: 4.8, bio: "Cardio & High-Intensity Interval Training (HIIT)" }
  ];
  localStorage.setItem("inba_gym_trainers", JSON.stringify(trainers));

  const products = [
    { id: "GYM-PROD-01", name: "Whey Protein (2kg)", sku: "GYM-WHEY-01", category: "Supplements", price: 5499, stock: 32, unitsSold: 45, revenue: 247455 },
    { id: "GYM-PROD-02", name: "Creatine (250g)", sku: "GYM-CREA-02", category: "Supplements", price: 999, stock: 8, unitsSold: 24, revenue: 23976 },
    { id: "GYM-PROD-03", name: "Gym Gloves", sku: "GYM-GLOV-03", category: "Accessories", price: 599, stock: 15, unitsSold: 18, revenue: 10782 },
    { id: "GYM-PROD-04", name: "Elite Gym T-Shirt", sku: "GYM-TSH-04", category: "Apparel", price: 799, stock: 4, unitsSold: 30, revenue: 23970 },
    { id: "GYM-PROD-05", name: "Smart Shaker (700ml)", sku: "GYM-SHAK-05", category: "Accessories", price: 399, stock: 22, unitsSold: 50, revenue: 19950 }
  ];
  localStorage.setItem("inba_gym_products", JSON.stringify(products));

  const firstNames = ["Rahul", "Anjali", "Siddharth", "Priya", "Amit", "Neha", "Rohan", "Sneha", "Karan", "Kirti", "Kabir", "Meera", "Aditya", "Riya", "Vikram", "Shalini", "Sunil", "Pooja", "Arjun", "Deepika"];
  const lastNames = ["Sharma", "Verma", "Mehta", "Patel", "Gupta", "Sen", "Reddy", "Dutt", "Malhotra", "Singh", "Yadav", "Nair", "Joshi", "Roy", "Kapoor", "Chawla", "Bose", "Trivedi", "Mishra", "Pillai"];
  const gymPlansList = ["Monthly Plan", "Quarterly Plan", "Half Yearly", "Annual Plan"];

  const members = [];
  const today = new Date();

  for (let i = 1; i <= 150; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[Math.floor(i * 1.5) % lastNames.length];
    const name = `${fName} ${lName}`;
    const mobile = `+91 ${98765} ${10000 + i * 5}`;
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@elitegym.com`;
    const trainer = i % 5 === 0 ? "None" : trainers[(i % 4)].name;
    const plan = gymPlansList[i % gymPlansList.length];
    
    const joinDaysAgo = 30 + (i * 2) % 150;
    const joinDate = new Date();
    joinDate.setDate(today.getDate() - joinDaysAgo);
    
    const expiryDate = new Date(joinDate);
    if (plan === "Monthly Plan") expiryDate.setMonth(expiryDate.getMonth() + 1);
    else if (plan === "Quarterly Plan") expiryDate.setMonth(expiryDate.getMonth() + 3);
    else if (plan === "Half Yearly") expiryDate.setMonth(expiryDate.getMonth() + 6);
    else if (plan === "Annual Plan") expiryDate.setMonth(expiryDate.getMonth() + 12);

    let status = "Active";
    if (expiryDate.getTime() < today.getTime()) {
      status = "Expired";
    } else if (i === 12 || i === 45) {
      status = "Frozen";
    } else if (i === 89) {
      status = "Cancelled";
    }

    const hasPT = i % 5 !== 0;
    const hasSupplements = i % 3 === 0;

    members.push({
      id: `MEM-${1000 + i}`,
      name,
      mobile,
      email,
      trainer,
      membership: plan,
      joinDate: joinDate.toISOString().split("T")[0],
      expiryDate: expiryDate.toISOString().split("T")[0],
      status,
      hasPT,
      hasSupplements,
      lastVisitDate: new Date(today.getTime() - ((i % 8) * 24 * 60 * 60 * 1000)).toISOString().split("T")[0]
    });
  }

  members[22].lastVisitDate = new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; 
  members[44].lastVisitDate = new Date(today.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; 
  members[66].lastVisitDate = new Date(today.getTime() - 17 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; 
  members[88].lastVisitDate = new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; 

  localStorage.setItem("inba_gym_members", JSON.stringify(members));

  const leadNames = ["Kavya Nair", "Tushar Kapoor", "Aditi Rao", "Rajesh Khanna", "Deepak Chawla", "Rhea Sen", "Manish Malhotra", "Ishaan Khattar", "Pooja Hegde", "Sanjay Kapoor"];
  const leadSources = ["Instagram Ads", "Google Maps", "Walk-In", "Friend Referral", "Facebook Post"];
  
  const leads = [];
  for (let i = 1; i <= 40; i++) {
    const name = leadNames[i % leadNames.length] + ` ${i}`;
    const mobile = `+91 98765 ${20000 + i}`;
    const source = leadSources[i % leadSources.length];
    const assignedStaff = trainers[i % trainers.length].name;
    const trialDaysOffset = (i % 5) - 2;
    const trialDate = new Date();
    trialDate.setDate(today.getDate() + trialDaysOffset);

    const stages = ["New", "Contacted", "Trial Booked", "Trial Completed", "Interested", "Follow Up", "Joined", "Lost"];
    const stage = stages[i % stages.length];

    leads.push({
      id: `LEAD-${500 + i}`,
      name,
      mobile,
      source,
      assignedStaff,
      trialDate: trialDate.toISOString().split("T")[0],
      stage,
      notes: i % 2 === 0 ? "Keen on high-intensity training plan." : "Requires personal trainer options."
    });
  }
  localStorage.setItem("inba_gym_leads", JSON.stringify(leads));

  const attendance = [];
  for (let d = 0; d < 90; d++) {
    const attendanceDate = new Date();
    attendanceDate.setDate(today.getDate() - d);
    const dateStr = attendanceDate.toISOString().split("T")[0];
    const checkinCount = 35 + (d % 15);
    for (let c = 0; c < checkinCount; c++) {
      const randomMember = members[Math.floor(Math.sin(d + c) * 75 + 75) % members.length];
      const checkinHour = c % 2 === 0 ? 7 + (c % 3) : 17 + (c % 3); 
      const checkinTime = `${checkinHour.toString().padStart(2, "0")}:${((c * 7) % 60).toString().padStart(2, "0")}`;
      const checkoutHour = checkinHour + 1;
      const checkoutTime = `${checkoutHour.toString().padStart(2, "0")}:${((c * 7 + 25) % 60).toString().padStart(2, "0")}`;
      
      attendance.push({
        id: `ATT-${d}-${c}`,
        memberId: randomMember.id,
        memberName: randomMember.name,
        date: dateStr,
        checkIn: checkinTime,
        checkOut: checkoutTime,
        trainer: randomMember.trainer,
        branch: "Elite Fitness Studio Main Branch"
      });
    }
  }
  localStorage.setItem("inba_gym_attendance", JSON.stringify(attendance));

  const goals = [
    { id: "GYM-GOL-01", type: "Monthly Revenue Goal", target: 400000, progress: 345000, month: "May 2026", status: "Active" },
    { id: "GYM-GOL-02", type: "Membership Goal", target: 200, progress: 150, month: "May 2026", status: "Active" },
    { id: "GYM-GOL-03", type: "Renewal Goal", target: 15, progress: 12, month: "May 2026", status: "Active" },
    { id: "GYM-GOL-04", type: "PT Revenue Goal", target: 200000, progress: 180000, month: "May 2026", status: "Active" },
    { id: "GYM-GOL-05", type: "Product Revenue Goal", target: 50000, progress: 45000, month: "May 2026", status: "Active" }
  ];
  localStorage.setItem("inba_gym_goals", JSON.stringify(goals));

  const gymExpenses = [
    { display_id: "G-EXP-01", category: "Rent", amount: 120000, notes: "Elite Studio Premises Rent", date: today.toISOString().split("T")[0] },
    { display_id: "G-EXP-02", category: "Salaries", amount: 80000, notes: "Trainers & Front Desk Payroll", date: today.toISOString().split("T")[0] },
    { display_id: "G-EXP-03", category: "Equipment", amount: 35000, notes: "Spin Bikes Lease & Treadmill AMC", date: today.toISOString().split("T")[0] },
    { display_id: "G-EXP-04", category: "Utilities", amount: 18000, notes: "Electricity & AC Maintenance Bills", date: today.toISOString().split("T")[0] },
    { display_id: "G-EXP-05", category: "Software", amount: 8500, notes: "Inba CRM & Attendance System License", date: today.toISOString().split("T")[0] }
  ];
  localStorage.setItem("inba_gym_expenses", JSON.stringify(gymExpenses));

  localStorage.setItem("inba_gym_seeded", "true");
};

interface PlatformContextProps {
  platform: BusinessPlatform;
  config: PlatformConfig;
  setPlatform: (newPlatform: BusinessPlatform) => Promise<boolean>;
  loading: boolean;
}

const PlatformContext = createContext<PlatformContextProps | undefined>(undefined);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [platform, setPlatformState] = useState<BusinessPlatform>("inba");
  const [loading, setLoading] = useState(true);

  const config = getPlatformConfig(platform);

  useEffect(() => {
    const initPlatform = async () => {
      // 1. Instantly read from LocalStorage for immediate UI paint
      const localPlat = localStorage.getItem("business_platform") as BusinessPlatform;
      if (localPlat) {
        setPlatformState(localPlat);
        if (localPlat === "gym-services" && localStorage.getItem("inba_gym_seeded") !== "true") {
          seedGymData();
        }
      }

      // 2. Try fetching from Supabase settings
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("business_platform")
          .eq("id", "default")
          .single();

        if (data && data.business_platform && !error) {
          const cloudPlat = data.business_platform as BusinessPlatform;
          setPlatformState(cloudPlat);
          localStorage.setItem("business_platform", cloudPlat);
          if (cloudPlat === "gym-services" && localStorage.getItem("inba_gym_seeded") !== "true") {
            seedGymData();
          }
        }
      } catch (err) {
        console.warn("Supabase database platform check skipped or failed (fallback to localStorage active):", err);
      } finally {
        setLoading(false);
      }
    };

    initPlatform();
  }, []);

  const setPlatform = async (newPlatform: BusinessPlatform): Promise<boolean> => {
    setLoading(true);
    try {
      // Always save to LocalStorage immediately
      localStorage.setItem("business_platform", newPlatform);
      setPlatformState(newPlatform);
      if (newPlatform === "gym-services" && localStorage.getItem("inba_gym_seeded") !== "true") {
        seedGymData();
      }

      // Attempt to save to Supabase settings table
      const { error } = await supabase
        .from("settings")
        .update({ business_platform: newPlatform })
        .eq("id", "default");

      if (error) {
        console.warn("Failed to update cloud database platform setting, saved locally instead:", error.message);
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Failed to update platform:", err);
      setLoading(false);
      return false;
    }
  };

  return (
    <PlatformContext.Provider value={{ platform, config, setPlatform, loading }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }
  return context;
};
