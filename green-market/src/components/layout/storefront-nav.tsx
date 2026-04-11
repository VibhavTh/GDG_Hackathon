"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { siteConfig } from "@/config/site";
import { useCartStore } from "@/stores/cart-store";

interface StorefrontNavProps {
  userRole: "vendor" | "customer" | "admin" | null;
}

export function StorefrontNav({ userRole }: StorefrontNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const [cartKey, setCartKey] = useState(0); // used to retrigger badge pop
  const prevCountRef = useRef(0);

  useEffect(() => setMounted(true), []);

  const itemCount = useCartStore((state) => state.itemCount());

  // Trigger badge pop animation when item count increases
  useEffect(() => {
    if (!mounted) return;
    if (itemCount > prevCountRef.current) {
      setCartKey((k) => k + 1);
    }
    prevCountRef.current = itemCount;
  }, [itemCount, mounted]);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${scrolled ? "bg-transparent" : "bg-primary-container"}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className={`text-2xl font-headline font-bold transition-all duration-300 hover:opacity-70 ${scrolled ? "text-on-surface" : "text-on-primary"}`}
        >
          {siteConfig.name}
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex gap-8 items-center font-headline italic text-lg tracking-tight">
          {siteConfig.storefrontNav.map((link) => {
            const isActive = pathname === link.href;
            const activeColor = scrolled ? "text-on-surface" : "text-on-primary";
            const inactiveColor = scrolled ? "text-on-surface/60 hover:text-on-surface" : "text-on-primary/70 hover:text-on-primary";
            const underlineColor = scrolled ? "after:bg-on-surface" : "after:bg-on-primary";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative pb-0.5 transition-all duration-150
                  hover:-translate-y-px
                  ${isActive
                    ? `${activeColor} after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 ${underlineColor} after:rounded-full`
                    : inactiveColor
                  }
                `}
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
            href="/cart"
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-150 active:scale-[0.97] ${scrolled ? "text-on-surface hover:bg-on-surface/10" : "text-on-primary hover:bg-on-primary/10"}`}
          >
            <Icon name="shopping_basket" />
            {mounted && itemCount > 0 && (
              <span
                key={cartKey}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-secondary text-on-secondary text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none animate-badge-pop"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
            <span className="font-label text-sm font-medium hidden sm:inline">
              Cart
            </span>
          </Link>

          {/* Auth-aware right button */}
          {(userRole === "admin" || userRole === "vendor") ? (
            <>
              <Link
                href="/dashboard"
                className={`px-5 py-2 rounded-md font-label font-bold text-sm active:scale-[0.97] transition-all duration-150 flex items-center gap-1.5 ${scrolled ? "bg-on-surface/10 text-on-surface hover:bg-on-surface/20" : "bg-on-primary/15 text-on-primary hover:bg-on-primary/25"}`}
              >
                <Icon name="dashboard" size="sm" />
                Dashboard
              </Link>
              <SignOutButton role="vendor" className={scrolled ? "text-on-surface/60 hover:text-error" : "text-on-primary/70 hover:text-on-primary hover:bg-on-primary/10"} />
            </>
          ) : userRole === "customer" ? (
            <>
              <Link
                href="/account"
                className={`px-5 py-2 rounded-md active:scale-[0.97] transition-all duration-150 font-label font-medium text-sm flex items-center gap-1.5 ${scrolled ? "border border-on-surface/30 text-on-surface hover:bg-on-surface/10" : "border border-on-primary/30 text-on-primary hover:bg-on-primary/10"}`}
              >
                <Icon name="person" size="sm" />
                My Account
              </Link>
              <SignOutButton role="customer" className={scrolled ? "text-on-surface/60 hover:text-error" : "text-on-primary/70 hover:text-on-primary hover:bg-on-primary/10"} />
            </>
          ) : (
            <Link
              href="/customer/login"
              className={`px-5 py-2 rounded-md active:scale-[0.97] transition-all duration-150 font-label font-medium text-sm inline-flex items-center gap-1.5 ${scrolled ? "border border-on-surface/30 text-on-surface hover:bg-on-surface/10" : "border border-on-primary/30 text-on-primary hover:bg-on-primary/10"}`}
            >
              <Icon name="person" size="sm" />
              Sign In
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded active:scale-[0.97] transition-all duration-150 ${scrolled ? "text-on-surface focus-visible:outline-on-surface" : "text-on-primary focus-visible:outline-on-primary"}`}
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
        className="md:hidden bg-primary-container px-6 overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          maxHeight: mobileMenuOpen ? "400px" : "0px",
          opacity: mobileMenuOpen ? 1 : 0,
        }}
      >
        <div className="space-y-4 pt-2 pb-6">
          {siteConfig.storefrontNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 font-headline italic text-lg text-on-primary/70 hover:text-on-primary transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
          {(userRole === "admin" || userRole === "vendor") ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-headline italic text-lg text-on-primary"
              >
                Dashboard
              </Link>
              <SignOutButton role="vendor" className="w-full justify-start px-0 py-3" />
            </>
          ) : userRole === "customer" ? (
            <>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 font-headline italic text-lg text-on-primary/70 hover:text-on-primary transition-colors duration-150"
              >
                My Account
              </Link>
              <SignOutButton role="customer" className="w-full justify-start px-0 py-3" />
            </>
          ) : (
            <Link
              href="/customer/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 font-headline italic text-lg text-on-primary/70 hover:text-on-primary transition-colors duration-150"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
