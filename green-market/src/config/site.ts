/** Products with stock at or below this value (but > 0) are flagged as low stock. */
export const LOW_STOCK_THRESHOLD = 5;

export const siteConfig = {
  name: "Green Market Farms",
  description:
    "Green Market Farms. Fresh, seasonal produce grown on our Blacksburg farm and delivered straight to your table.",
  storefrontNav: [
    { label: "Home", href: "/" },
    { label: "Market", href: "/products" },
    { label: "Gallery", href: "/gallery" },
    { label: "About", href: "https://greenmarketfarms.org/about" },
    { label: "Contact", href: "/contact" },
  ],
  adminNav: [
    { label: "Overview", href: "/dashboard", icon: "dashboard" },
    { label: "Inventory", href: "/inventory", icon: "potted_plant" },
    { label: "Orders", href: "/orders", icon: "receipt_long" },
    { label: "Analytics", href: "/dashboard/analytics", icon: "bar_chart" },
    { label: "Events", href: "/admin/events", icon: "event" },
    { label: "Newsletter", href: "/admin/newsletter", icon: "mail" },
    { label: "Inbox", href: "/admin", icon: "inbox" },
  ],
} as const;
