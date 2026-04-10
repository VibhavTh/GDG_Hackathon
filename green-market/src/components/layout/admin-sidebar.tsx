"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { siteConfig } from "@/config/site";
import { logout } from "@/app/vendor/logout/actions";

interface AdminSidebarProps {
  farmName: string;
  userInitial: string;
  inboxUnread?: number;
}

export function AdminSidebar({ farmName, userInitial, inboxUnread = 0 }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface-container-low shadow-ambient sticky top-20 shrink-0 z-40 py-6" style={{ height: "calc(100vh - 5rem)" }}>
      {/* Header */}
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
            <Icon name="potted_plant" fill />
          </div>
          <div>
            <h1 className="font-headline text-lg text-tertiary font-bold leading-tight">
              Green Market
            </h1>
            <p className="text-xs text-on-surface-variant/60 italic">
              Farm Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2">
        {siteConfig.adminNav.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && link.href !== "/admin" && pathname.startsWith(link.href)) || (link.href === "/admin" && pathname === "/admin");
          const badge = link.href === "/admin" ? inboxUnread : 0;
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
              <span className="text-sm font-medium flex-1">{link.label}</span>
              {badge > 0 && (
                <span className="bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
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

        <Link
          href="/"
          className="w-full text-on-surface-variant/60 py-2 rounded-lg flex items-center justify-center gap-2 hover:text-tertiary hover:bg-surface-container-highest/50 transition-all text-sm"
        >
          <Icon name="storefront" size="sm" />
          View Storefront
        </Link>

        {/* User card + sign out */}
        <div className="flex items-center gap-3 p-2 pt-4">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-tertiary truncate">{farmName}</p>
            <p className="text-xs text-on-surface-variant">Farm Owner</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              className="p-1.5 rounded-md text-on-surface-variant/50 hover:text-primary hover:bg-surface-container-highest transition-colors"
            >
              <Icon name="logout" size="sm" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
