"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";

const orders = [
  {
    id: "GM-2940",
    customer: "Eleanor Vance",
    time: "20 mins ago",
    status: "Preparing",
    statusStyle: "bg-secondary-fixed text-on-secondary-fixed",
    avatarBg: "bg-secondary-fixed",
    total: "$42.50",
    items: ["Heirloom Tomatoes (2lb)", "Fresh Basil Bush", "+2 items"],
    detailItems: [
      {
        name: "Heirloom Tomatoes",
        detail: "2 lbs · Mixed Varieties",
        price: "$18.00",
        icon: "eco",
      },
      {
        name: "Fresh Basil Bush",
        detail: "1 Large Pot",
        price: "$12.00",
        icon: "potted_plant",
      },
      {
        name: "Farm Fresh Eggs",
        detail: "1 Dozen · Pasture Raised",
        price: "$12.50",
        icon: "egg",
      },
    ],
    specialInstructions:
      '"Please select the greenest tomatoes possible for Fried Green Tomatoes tomorrow! Also, if the eggs could be the blue shelled ones, my kids would love it. Thank you!"',
  },
  {
    id: "GM-2938",
    customer: "Julian Thorne",
    time: "1 hour ago",
    status: "Confirmed",
    statusStyle: "bg-primary-fixed text-on-primary-fixed",
    avatarBg: "bg-primary-fixed",
    total: "$28.00",
    items: ["Wildflower Honey (16oz)", "Organic Sourdough"],
  },
  {
    id: "GM-2935",
    customer: "Sarah Jenkins",
    time: "3 hours ago",
    status: "Placed",
    statusStyle: "bg-surface-container-highest text-on-surface-variant",
    avatarBg: "bg-tertiary-fixed",
    total: "$14.25",
    items: ["Late Summer Squash (3lb)"],
  },
];

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);
  const [cancelState, setCancelState] = useState<"idle" | "confirming">("idle");

  const selectOrder = useCallback((order: (typeof orders)[0]) => {
    setSelectedOrder(order);
    setCancelState("idle");
  }, []);

  return (
    <div className="p-6 md:p-12">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-3 flex items-center gap-2">
            <span>Admin</span>
            <Icon name="chevron_right" size="sm" />
            <span className="text-primary font-bold">Order Inbox</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-headline font-semibold text-tertiary italic">
            Harvest Requests
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-md">
            Manage your daily yields and direct-to-consumer fulfillment requests
            from the community.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              className="bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 text-sm w-full max-w-xs transition-all"
              placeholder="Search orders..."
              type="search"
              aria-label="Search orders"
            />
          </div>
          <button
            className="p-2 bg-surface-container-low text-primary rounded-full hover:bg-surface-container-highest transition-colors"
            aria-label="Filter orders"
          >
            <Icon name="filter_list" />
          </button>
        </div>
      </header>

      {/* Orders Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Order List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-6">
            Recent Activity
          </h3>

          {orders.map((order) => {
            const isSelected = selectedOrder.id === order.id;
            return (
              <div
                key={order.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Order ${order.id} from ${order.customer}`}
                onClick={() => selectOrder(order)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && selectOrder(order)}
                className={`p-6 rounded-xl transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                  isSelected
                    ? "bg-surface-container-lowest shadow-ambient"
                    : "bg-surface-container-low hover:bg-surface-container-highest/50"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-full ${order.avatarBg} flex items-center justify-center`}
                    >
                      <Icon name="person" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-on-surface">
                        {order.customer}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        Order #{order.id} &middot; {order.time}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 ${order.statusStyle} text-[10px] uppercase font-bold tracking-widest rounded-full`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {order.items.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-1 bg-surface-container text-on-surface-variant text-xs rounded-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 bg-surface-container-low/30 -mx-6 px-6 -mb-6 pb-6 rounded-b-xl">
                  <p className="font-headline text-xl font-bold text-tertiary">
                    {order.total}
                  </p>
                  <button className="text-primary text-sm font-semibold flex items-center gap-1 group">
                    View Details
                    <Icon
                      name="arrow_forward"
                      size="sm"
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-surface-container-highest rounded-2xl overflow-hidden shadow-ambient">
            <div className="h-32 relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgKDrjBsIJas6mfL9Ub-QyqsFGtcpd5Pg924MLauhtjgr6RFLQTxpp9FN78KP03Dxa-SMh_wUCbQjPjYgHtvRVqgDYhZbJSWM7_5TEIddKTw7flNDq_ELJ_koRwx6WU0ItRyWcwAtYyVC6DivPyax9QFUYzvB5f2P8LFxsBQXFKCII0oDu-SAmPt44JjEqzPNFDzdN7g60BRKCcX3PQVQi5zI349lhbWJ_FEVDjgr5tvlwTKcLei_16E9Zv2DdQz8umB3EPJvMXDjY"
                alt="Farmers market stall"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest to-transparent" />
              <div className="absolute bottom-4 left-6">
                <h2 className="text-2xl font-headline font-bold text-tertiary">
                  Order Details
                </h2>
                <p className="text-xs text-on-surface-variant font-medium tracking-widest uppercase">
                  #{selectedOrder.id}
                </p>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Items */}
              {selectedOrder.detailItems && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-secondary mb-4">
                    Produce Reserved
                  </p>
                  <ul className="space-y-4">
                    {selectedOrder.detailItems.map((item) => (
                      <li
                        key={item.name}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                            <Icon
                              name={item.icon}
                              className="text-primary"
                              size="sm"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">
                              {item.name}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold">{item.price}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <div className="bg-surface-container-low p-5 rounded-xl italic">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 not-italic">
                    Special Instructions
                  </p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {selectedOrder.specialInstructions}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button className="flex-1 py-4 bg-primary text-on-primary rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all">
                    Ready for Pickup
                  </button>
                  <button className="px-4 py-4 bg-surface-container text-on-surface rounded-xl font-bold hover:bg-surface-container-low transition-colors">
                    <Icon name="print" />
                  </button>
                </div>
                <div className="flex justify-between items-center px-2">
                  {cancelState === "idle" ? (
                    <button
                      onClick={() => setCancelState("confirming")}
                      className="text-error text-xs font-bold uppercase tracking-wider hover:underline underline-offset-4 transition-colors"
                    >
                      Cancel Order
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-on-surface-variant font-body">
                        Are you sure?
                      </span>
                      <button
                        onClick={() => {
                          // TODO(Phase 1): fire cancel order mutation via Supabase + trigger Stripe refund
                          setCancelState("idle");
                        }}
                        className="text-error text-xs font-bold uppercase tracking-wider underline underline-offset-4"
                      >
                        Yes, Cancel
                      </button>
                      <span className="text-on-surface-variant/40 text-xs">·</span>
                      <button
                        onClick={() => setCancelState("idle")}
                        className="text-primary text-xs font-bold uppercase tracking-wider hover:underline underline-offset-4"
                      >
                        Keep
                      </button>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                      Total Value
                    </p>
                    <p className="text-2xl font-headline font-bold text-tertiary">
                      {selectedOrder.total}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
