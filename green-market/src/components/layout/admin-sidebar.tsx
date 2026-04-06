"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { siteConfig } from "@/config/site";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-surface-container-low shadow-ambient sticky top-0 shrink-0 z-40 py-6">
      {/* Header */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <Icon name="potted_plant" fill />
          </div>
          <div>
            <h1 className="font-headline text-lg text-tertiary font-bold leading-tight">
              Green Market Admin
            </h1>
            <p className="text-xs text-on-surface-variant/60 italic">
              Managing the Hearth
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {siteConfig.adminNav.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${
                  isActive
                    ? "bg-surface-container-highest text-primary font-bold"
                    : "text-tertiary/60 hover:bg-surface-container-highest/50"
                }
              `}
            >
              <Icon name={link.icon} fill={isActive} />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-4 space-y-4">
        <Link
          href="/inventory"
          className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-primary-container text-sm"
        >
          <Icon name="add" size="sm" />
          New Listing
        </Link>

        <div className="flex items-center gap-3 p-2 pt-4">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold">
            E
          </div>
          <div>
            <p className="text-sm font-bold text-tertiary">Farm Owner</p>
            <p className="text-xs text-on-surface-variant">Green Market</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
