"use client";

import { Icon } from "@/components/ui/icon";
import { customerLogout } from "@/app/customer/logout/actions";
import { logout as vendorLogout } from "@/app/vendor/logout/actions";

interface SignOutButtonProps {
  role: "vendor" | "customer";
  className?: string;
}

export function SignOutButton({ role, className = "" }: SignOutButtonProps) {
  return (
    <form action={role === "vendor" ? vendorLogout : customerLogout}>
      <button
        type="submit"
        title="Sign out"
        className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors font-label font-medium text-sm ${className || "text-on-surface-variant hover:text-error hover:bg-surface-container-low"}`}
      >
        <Icon name="logout" size="sm" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </form>
  );
}
