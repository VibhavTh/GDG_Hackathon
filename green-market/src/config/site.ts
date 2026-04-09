/** Products with stock at or below this value (but > 0) are flagged as low stock. */
export const LOW_STOCK_THRESHOLD = 5;

export const siteConfig = {
  name: "The Green Market Farm",
  description:
    "A local farm marketplace — discover fresh, seasonal produce from growers in your community.",
  storefrontNav: [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "About", href: "/#about" },
  ],
  adminNav: [
    { label: "Overview", href: "/dashboard", icon: "dashboard" },
    { label: "Inventory", href: "/inventory", icon: "potted_plant" },
    { label: "Orders", href: "/orders", icon: "inbox" },
    { label: "Settings", href: "/settings", icon: "settings" },
  ],
} as const;
