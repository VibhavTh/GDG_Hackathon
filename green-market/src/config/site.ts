export const siteConfig = {
  name: "The Green Market Farm",
  description:
    "Farm-to-table marketplace — hand-sown, heart-grown produce delivered from our soil to your table.",
  storefrontNav: [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "About", href: "/#about" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  adminNav: [
    { label: "Overview", href: "/dashboard", icon: "dashboard" },
    { label: "Inventory", href: "/inventory", icon: "potted_plant" },
    { label: "Orders", href: "/orders", icon: "inbox" },
    { label: "Settings", href: "/settings", icon: "settings" },
  ],
} as const;
