/** Products with stock at or below this value (but > 0) are flagged as low stock. */
export const LOW_STOCK_THRESHOLD = 5;

export const siteConfig = {
  name: "The Green Market Farm",
  description:
    "The Green Market Farm. Fresh, seasonal produce grown on our Blacksburg farm and delivered straight to your table.",
  storefrontNav: [
    { label: "Home", href: "/" },
    { label: "Market", href: "/products" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/contact" },
  ],
  adminNav: [
    { label: "Overview", href: "/dashboard", icon: "dashboard" },
    { label: "Inventory", href: "/inventory", icon: "potted_plant" },
    { label: "Orders", href: "/orders", icon: "inbox" },
    { label: "Settings", href: "/settings", icon: "settings" },
  ],
} as const;
