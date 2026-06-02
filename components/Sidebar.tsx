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
  Target,
  Lock
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Sales", href: "/sales", icon: ShoppingCart },
  { name: "Purchases", href: "/purchases", icon: Briefcase },
  { name: "Expenses", href: "/expenses", icon: Wallet },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Goals", href: "/goals", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();

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
