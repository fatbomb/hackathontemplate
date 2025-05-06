"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  User,
  CreditCard,
  BarChart3,
  HelpCircle,
  LogOut,
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/dashboard/help",
    icon: HelpCircle,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden relative md:flex flex-col pt-8 border-r h-full">
      <div className="space-y-4 px-4">
        <nav className="flex flex-col space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted",
                pathname === item.href
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <button className="flex items-center gap-3 hover:bg-muted px-3 py-2 rounded-lg w-full font-medium text-muted-foreground text-sm transition-all">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}