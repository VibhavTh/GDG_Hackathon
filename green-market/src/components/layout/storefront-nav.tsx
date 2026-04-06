"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { siteConfig } from "@/config/site";
import { useCartStore } from "@/stores/cart-store";

export function StorefrontNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Defer cart count to client-only to avoid SSR/hydration mismatch with persisted store
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const itemCount = useCartStore((state) => state.itemCount());

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-headline font-bold text-tertiary"
        >
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
                className={`
                  transition-colors duration-300
                  ${
                    isActive
                      ? "text-primary-container border-b-2 border-secondary pb-1"
                      : "text-tertiary/70 hover:text-primary-container hover:bg-surface-container-low"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
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

          <Link
            href="/farmer/login"
            className="px-6 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-md hover:opacity-90 transition-all active:scale-95 font-label font-medium"
          >
            Login
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-tertiary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} />
          </button>
        </div>
      </div>

      {/* Mobile Menu — CSS-toggled so it animates and avoids layout thrash */}
      <div
        className={`md:hidden bg-surface/95 backdrop-blur-xl px-6 overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 pb-0 opacity-0"
        }`}
      >
        <div className="space-y-4 pt-2">
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
        </div>
      </div>
    </nav>
  );
}
