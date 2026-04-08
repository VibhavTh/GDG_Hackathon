"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { siteConfig } from "@/config/site";
import { useCartStore } from "@/stores/cart-store";

interface StorefrontNavProps {
  userRole: "farmer" | "customer" | null;
}

export function StorefrontNav({ userRole }: StorefrontNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const itemCount = useCartStore((state) => state.itemCount());

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-headline font-bold text-tertiary">
          {siteConfig.name}
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 items-center font-headline italic text-lg tracking-tight">
          {siteConfig.storefrontNav.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-300 ${
                  isActive
                    ? "text-primary-container border-b-2 border-secondary pb-1"
                    : "text-tertiary/70 hover:text-primary-container hover:bg-surface-container-low"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link
            href="/checkout"
            className="relative flex items-center gap-2 px-4 py-2 text-tertiary hover:bg-surface-container-low rounded-lg transition-all active:scale-95"
          >
            <Icon name="shopping_basket" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-secondary text-on-secondary text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
            <span className="font-label text-sm font-medium hidden sm:inline">
              Cart
            </span>
          </Link>

          {/* Auth-aware right button */}
          {userRole === "farmer" ? (
            <Link
              href="/dashboard"
              className="px-5 py-2 bg-primary text-on-primary rounded-md font-label font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Icon name="dashboard" size="sm" />
              Dashboard
            </Link>
          ) : userRole === "customer" ? (
            <Link
              href="/account/orders"
              className="px-5 py-2 border border-primary/30 text-primary rounded-md hover:bg-surface-container-low transition-all active:scale-95 font-label font-medium text-sm flex items-center gap-1.5"
            >
              <Icon name="person" size="sm" />
              My Orders
            </Link>
          ) : (
            <Link
              href="/customer/login"
              className="px-5 py-2 border border-primary/30 text-primary rounded-md hover:bg-surface-container-low transition-all active:scale-95 font-label font-medium text-sm hidden sm:inline-flex items-center gap-1.5"
            >
              <Icon name="person" size="sm" />
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-tertiary focus-visible:outline-2 focus-visible:outline-primary rounded"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        aria-hidden={!mobileMenuOpen}
        className="md:hidden bg-surface/95 backdrop-blur-xl px-6 grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
        style={{
          gridTemplateRows: mobileMenuOpen ? "1fr" : "0fr",
          opacity: mobileMenuOpen ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-2 pb-6">
            {siteConfig.storefrontNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-headline italic text-lg text-tertiary/70 hover:text-primary-container transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile auth link */}
            {userRole === "farmer" ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-headline italic text-lg text-primary transition-colors"
              >
                Dashboard
              </Link>
            ) : userRole === "customer" ? (
              <Link
                href="/account/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-headline italic text-lg text-tertiary/70 hover:text-primary-container transition-colors"
              >
                My Orders
              </Link>
            ) : (
              <Link
                href="/customer/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-headline italic text-lg text-tertiary/70 hover:text-primary-container transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
