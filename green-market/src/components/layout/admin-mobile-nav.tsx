"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";

const mobileNavItems = [
  { label: "Home", href: "/dashboard", icon: "dashboard" },
  { label: "Stock", href: "/inventory", icon: "potted_plant" },
  { label: "Orders", href: "/orders", icon: "inbox" },
  { label: "Profile", href: "/settings", icon: "account_circle" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-lg px-4 py-3 flex justify-between items-center z-50">
      {mobileNavItems.map((item, index) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

        // Insert the floating FAB in the middle
        if (index === 2) {
          return (
            <div key="fab-wrapper" className="flex items-center gap-6">
              {/* Floating Add button */}
              <Link
                href="/inventory"
                className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-ambient -translate-y-6"
              >
                <Icon name="add" />
              </Link>

              {/* Orders item */}
              <Link
                href={item.href}
                className={`flex flex-col items-center ${
                  isActive ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                <Icon name={item.icon} fill={isActive} />
                <span className="text-[10px] mt-1 font-bold">{item.label}</span>
              </Link>
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center ${
              isActive ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <Icon name={item.icon} fill={isActive} />
            <span className="text-[10px] mt-1 font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
