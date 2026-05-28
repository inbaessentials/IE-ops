"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Target
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
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed top-0 left-0">
      <div className="py-6 px-6 border-b border-gray-200 justify-start flex items-center">
        <Link href="/" className="flex items-center">
          <img 
            src="/logo.png" 
            alt="Inba Essentials" 
            className="h-12 w-auto object-contain hover:opacity-90 transition-opacity" 
          />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

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
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-secondary">Admin User</span>
            <span className="text-xs text-gray-500">admin@inba.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
