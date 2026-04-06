import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const stats = [
  {
    label: "Total Revenue",
    value: "$12,482",
    change: "+12%",
    changeColor: "text-primary bg-primary-fixed",
    note: "Growth compared to last harvest cycle",
  },
  {
    label: "Harvest Orders",
    value: "42",
    change: "Pending Fulfillment",
    changeColor: "text-secondary",
  },
  {
    label: "Stock Alerts",
    alerts: [
      { name: "Organic Kale", status: "Low Stock" },
      { name: "Heirloom Honey", status: "Low Stock" },
    ],
  },
];

const orders = [
  {
    initials: "JB",
    name: "Julianne Black",
    method: "Local Pick-up",
    items: "Organic Carrots (2lb), Goat Cheese, Rye Bread",
    status: "In Preparation",
    statusStyle: "bg-primary/10 text-primary",
    total: "$42.50",
  },
  {
    initials: "MT",
    name: "Marcus Thorne",
    method: "Farm Delivery",
    items: "Seasonal Box (Large), Raw Honey, Wildflowers",
    status: "Awaiting Pick-up",
    statusStyle: "bg-secondary-container/20 text-on-secondary-container",
    total: "$115.00",
  },
  {
    initials: "SV",
    name: "Sarah Vane",
    method: "Local Pick-up",
    items: "Heritage Eggs (2 doz), Sourdough Starter",
    status: "In Preparation",
    statusStyle: "bg-primary/10 text-primary",
    total: "$28.90",
  },
];

const chartData = [
  { day: "Mon", height: "40%" },
  { day: "Tue", height: "65%" },
  { day: "Wed", height: "50%" },
  { day: "Thu", height: "85%" },
  { day: "Fri", height: "100%", highlight: true, value: "$2,140" },
  { day: "Sat", height: "75%" },
  { day: "Sun", height: "45%" },
];

export default function DashboardPage() {
  return (
    <main className="flex-1 px-8 py-10 max-w-7xl">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-headline italic text-tertiary leading-tight">
            Good morning, Farmer.
          </h2>
          <p className="text-on-surface-variant font-body mt-2">
            Your listings are live and orders are coming in.
          </p>
        </div>
        <div className="bg-surface-container-low px-4 py-2 rounded-lg flex items-center gap-2">
          <Icon name="calendar_today" className="text-secondary" size="sm" />
          <span className="text-sm font-medium">May 12, 2024</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Revenue */}
        <div className="bg-surface-container-low p-8 rounded-xl group">
          <p className="text-sm font-label text-on-surface-variant mb-4 uppercase tracking-wider">
            Total Revenue
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-headline italic text-primary">
              $12,482
            </h3>
            <span className="text-xs text-primary bg-primary-fixed px-2 py-1 rounded-full font-bold">
              +12%
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-4">
            Growth compared to last harvest cycle
          </p>
        </div>

        {/* Orders */}
        <div className="bg-surface-container-highest p-8 rounded-xl">
          <p className="text-sm font-label text-on-surface-variant mb-4 uppercase tracking-wider">
            Harvest Orders
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-headline italic text-tertiary">42</h3>
            <span className="text-xs text-secondary font-medium">
              Pending Fulfillment
            </span>
          </div>
          <div className="mt-6 flex -space-x-2">
            {[
              "bg-surface-container-high",
              "bg-surface-container-highest",
              "bg-surface-variant",
            ].map((bg, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 border-surface-container-highest ${bg}`}
              />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-surface-container-highest bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
              +39
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-surface-container-low p-8 rounded-xl">
          <p className="text-sm font-label text-on-surface-variant mb-4 uppercase tracking-wider">
            Stock Alerts
          </p>
          <div className="space-y-3">
            {["Organic Kale", "Heirloom Honey"].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item}</span>
                <span className="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                  Low Stock
                </span>
              </div>
            ))}
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-4">
              <div
                className="bg-secondary h-1.5 rounded-full"
                style={{ width: "85%" }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant/70 italic text-right">
              85% of capacity reached
            </p>
          </div>
        </div>
      </div>

      {/* Chart + Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        {/* Sales Chart */}
        <div className="lg:col-span-3 bg-surface-container-low p-8 rounded-xl h-80 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-headline italic text-xl text-tertiary">
              Sales Performance
            </h4>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1 bg-surface-container rounded-full text-on-surface-variant">
                Daily
              </button>
              <button className="text-xs px-3 py-1 bg-primary text-on-primary rounded-full">
                Weekly
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-4 px-4 pb-4">
            {chartData.map((bar) => (
              <div
                key={bar.day}
                className={`flex-1 rounded-t-lg transition-all hover:opacity-80 relative ${
                  bar.highlight
                    ? "bg-primary"
                    : "bg-primary/10 hover:bg-primary/20"
                }`}
                style={{ height: bar.height }}
                title={bar.day}
              >
                {bar.value && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-tertiary text-on-tertiary text-[10px] py-1 px-2 rounded whitespace-nowrap">
                    {bar.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Harvest Card */}
        <div className="bg-surface-container p-8 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUPLv42vJdDprFHB0Pv1XL0RA69yOfL9APUOi_NotgyLYhLOD_Fy6gZOjb8TXlyv8X6--2e7psKnXtmRIHbl3lpSyQ2lweW9rBf-X8-tT-7mWAVo9SM18IXo-hBGckrjZiXnJ4qi1bRF6eYLdv2lTGcO4Fh1yCMUQ5rc_unD7UUjlhU9jy1bftJheLk1QzzaN99IfdNS4YOsStc4_FpriFp962QAfu1M8yHWIKeinBZcps3objw4WYXLltaEDmMReM6NsTlkuwPfcd"
            alt="Fresh organic vegetables in a wooden harvest basket"
            width={128}
            height={128}
            sizes="128px"
            loading="lazy"
            className="absolute -top-4 -right-4 w-32 h-32 object-cover rounded-lg rotate-12 opacity-80"
          />
          <div className="relative z-10">
            <h4 className="font-headline italic text-xl text-tertiary">
              Quick Harvest
            </h4>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              Prepare batch for morning local market deliveries.
            </p>
          </div>
          <button className="bg-primary text-on-primary px-6 py-3 rounded-md text-sm font-bold flex items-center justify-center gap-2 mt-6 active:scale-95 transition-all hover:bg-primary-container">
            Generate Manifest
          </button>
        </div>
      </div>

      {/* Active Orders — table on md+, stacked cards on mobile */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden mb-12">
        <div className="px-6 md:px-8 py-6 flex justify-between items-center">
          <h4 className="font-headline italic text-2xl text-tertiary">
            Active Harvest Orders
          </h4>
          <Link
            href="/orders"
            className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
          >
            View All <Icon name="arrow_forward" size="sm" />
          </Link>
        </div>

        {/* Mobile: stacked cards */}
        <div className="md:hidden divide-y divide-surface-container">
          {orders.map((order, i) => (
            <div key={i} className="px-6 py-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-tertiary text-sm">
                    {order.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">{order.name}</p>
                    <p className="text-xs text-on-surface-variant">{order.method}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${order.statusStyle}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-1">{order.items}</p>
              <p className="text-right font-bold text-tertiary text-sm">{order.total}</p>
            </div>
          ))}
        </div>

        {/* Desktop: full table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container/50">
                <th scope="col" className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant text-left">
                  Customer
                </th>
                <th scope="col" className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant text-left">
                  Harvest Items
                </th>
                <th scope="col" className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant text-left">
                  Status
                </th>
                <th scope="col" className="px-8 py-4 text-xs font-label uppercase tracking-widest text-on-surface-variant text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr
                  key={i}
                  className={`hover:bg-surface-container-high/50 transition-colors ${
                    i % 2 === 1 ? "bg-surface-container-low/50" : ""
                  }`}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-tertiary">
                        {order.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{order.name}</p>
                        <p className="text-xs text-on-surface-variant">
                          {order.method}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-on-surface-variant max-w-[240px]">
                    <span className="line-clamp-2">{order.items}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${order.statusStyle}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-bold text-tertiary">
                    {order.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
