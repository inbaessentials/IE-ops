"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { usePlatform } from "@/lib/PlatformContext";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  Users, 
  Briefcase, 
  ArchiveRestore, 
  Wallet, 
  BarChart3, 
  Settings,
  Target,
  Filter,
  CalendarCheck,
  ShieldCheck,
  ShoppingBag,
  Lock
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Purchases", href: "/purchases", icon: Briefcase },
  { name: "Returns", href: "/returns", icon: ArchiveRestore },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Goals", href: "/goals", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { platform, config } = usePlatform();

  const labelMap = useMemo(() => {
    const map: Record<string, string> = {};
    config.sidebar.forEach((item) => {
      map[item.name] = item.label;
    });
    return map;
  }, [config.sidebar]);

  const menuItems = useMemo(() => {
    let list = [...navItems];
    if (platform === "online-course") {
      // Hide Marketing Spend (Purchases)
      list = list.filter(item => item.name !== "Purchases");
      
      // Insert Leads after Sales
      const salesIdx = list.findIndex(item => item.name === "Sales");
      if (salesIdx !== -1) {
        list.splice(salesIdx + 1, 0, { name: "Leads", href: "/leads", icon: Filter });
      }

      // Insert Team after Customers (find index of Customers first)
      const custIndex = list.findIndex(item => item.href === "/customers");
      if (custIndex !== -1) {
        list.splice(custIndex + 1, 0, { name: "Team", href: "/team", icon: ShieldCheck });
      }
    } else if (platform === "gym-services") {
      const dashboard = list.find(item => item.name === "Dashboard")!;
      const members = list.find(item => item.name === "Customers")!;
      const memberships = list.find(item => item.name === "Inventory")!;
      const revenue = list.find(item => item.name === "Sales")!;
      const expenses = list.find(item => item.name === "Expenses")!;
      const reports = list.find(item => item.name === "Reports")!;
      const goals = list.find(item => item.name === "Goals")!;
      
      list = [
        dashboard,
        members,
        memberships,
        { name: "Supplements", href: "/products", icon: ShoppingBag },
        { name: "Attendance", href: "/attendance", icon: CalendarCheck },
        revenue,
        expenses,
        reports,
        goals
      ];
    }
    return list;
  }, [platform]);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed top-0 left-0">
      <div className="py-6 px-6 border-b border-gray-200 justify-start flex items-center">
        <Link href="/" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-12 w-auto object-contain hover:opacity-90 transition-opacity" 
          />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const displayName = labelMap[item.name] || item.name;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-[#2E8C13]/10 text-[#2E8C13]" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#2E8C13]" : "text-gray-400"}`} />
              {displayName}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-gray-200 p-3 space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pathname.startsWith("/settings") 
              ? "bg-[#2E8C13]/10 text-[#2E8C13]" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Settings className={`w-5 h-5 ${pathname.startsWith("/settings") ? "text-[#2E8C13]" : "text-gray-400"}`} />
          Settings
        </Link>
        <div className="h-px bg-gray-200 my-2 mx-2"></div>
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            pathname.startsWith("/admin") 
              ? "bg-primary/10 text-primary" 
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <Lock className={`w-5 h-5 ${pathname.startsWith("/admin") ? "text-primary" : "text-gray-400"}`} />
          Admin
        </Link>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-secondary">Admin User</span>
            <span className="text-xs text-gray-500">neemtreeapps@gmail.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

