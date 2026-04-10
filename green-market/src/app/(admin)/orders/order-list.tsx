"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import type { OrderStatus } from "@/lib/supabase/types";
import { advanceOrderStatus, cancelOrder } from "./actions";

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  products: { name: string; image_url: string | null } | null;
};

type Order = {
  order_id: string;
  customer_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  order_date: string;
  total_amount: number;
  special_instructions: string | null;
  order_items: OrderItem[];
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending_payment: "bg-surface-container text-on-surface-variant",
  placed: "bg-surface-container-highest text-on-surface-variant",
  confirmed: "bg-primary-fixed text-on-primary-fixed",
  preparing: "bg-secondary-fixed text-on-secondary-fixed",
  ready: "bg-tertiary-fixed text-on-tertiary-fixed",
  fulfilled: "bg-surface-container text-on-surface-variant",
  cancelled: "bg-error-container text-on-error-container",
  failed: "bg-error-container text-on-error-container",
  abandoned: "bg-surface-container text-on-surface-variant",
};

const AVATAR_BG: Record<OrderStatus, string> = {
  pending_payment: "bg-surface-container",
  placed: "bg-tertiary-fixed",
  confirmed: "bg-primary-fixed",
  preparing: "bg-secondary-fixed",
  ready: "bg-tertiary-fixed",
  fulfilled: "bg-surface-container",
  cancelled: "bg-error-container",
  failed: "bg-error-container",
  abandoned: "bg-surface-container",
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  placed: "Confirm Order",
  confirmed: "Start Preparing",
  preparing: "Mark Ready",
  ready: "Mark Fulfilled",
};

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function getDisplayName(order: Order) {
  if (order.guest_email) return order.guest_email.split("@")[0];
  return "Customer";
}

function getInitials(order: Order) {
  const name = getDisplayName(order);
  return name.slice(0, 2).toUpperCase();
}

function getRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

const FILTER_STATUSES: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "placed", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrderList({ orders }: { orders: Order[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      if (!matchesStatus) return false;
      if (!q) return true;
      const id = o.order_id.slice(0, 8).toLowerCase();
      const email = o.guest_email?.toLowerCase() ?? "";
      const displayName = getDisplayName(o).toLowerCase();
      return id.includes(q) || email.includes(q) || displayName.includes(q);
    });
  }, [orders, searchQuery, statusFilter]);

  const [selectedId, setSelectedId] = useState<string>(
    orders[0]?.order_id ?? ""
  );
  const [cancelState, setCancelState] = useState<"idle" | "confirming">("idle");
  const [pending, setPending] = useState(false);

  const selectedOrder = filteredOrders.find((o) => o.order_id === selectedId) ?? filteredOrders[0] ?? null;

  const selectOrder = useCallback((id: string) => {
    setSelectedId(id);
    setCancelState("idle");
  }, []);

  async function handleAdvance() {
    if (!selectedOrder) return;
    setPending(true);
    await advanceOrderStatus(selectedOrder.order_id, selectedOrder.status);
    setPending(false);
  }

  async function handleCancel() {
    if (!selectedOrder) return;
    setPending(true);
    await cancelOrder(selectedOrder.order_id);
    setCancelState("idle");
    setPending(false);
  }

  if (orders.length === 0) {
    return (
      <div className="p-6 md:p-12">
        <header className="mb-10">
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-3 flex items-center gap-2">
            <span>Admin</span>
            <Icon name="chevron_right" size="sm" />
            <span className="text-primary font-bold">Order Inbox</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-headline font-semibold text-tertiary italic">
            Orders
          </h1>
        </header>
        <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
          <Icon name="inbox" className="text-4xl mb-4" />
          <p className="font-headline italic text-2xl text-tertiary mb-2">No orders yet</p>
          <p className="text-sm">Orders from customers will appear here.</p>
        </div>
      </div>
    );
  }

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
            Orders
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-md">
            Manage and fulfill customer orders from your shop.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                className="bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/20 text-sm w-full max-w-xs transition-all"
                placeholder="Search by email or order ID..."
                type="search"
                aria-label="Search orders"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`p-2 rounded-full transition-colors ${showFilters || statusFilter !== "all" ? "bg-primary text-on-primary" : "bg-surface-container-low text-primary hover:bg-surface-container-highest"}`}
              aria-label="Filter orders"
            >
              <Icon name="filter_list" />
            </button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-2 justify-end">
              {FILTER_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors active:scale-[0.96] ${
                    statusFilter === s.value
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Orders Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Order List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant/60 mb-6">
            {filteredOrders.length === orders.length
              ? "Recent Activity"
              : `${filteredOrders.length} of ${orders.length} orders`}
          </h3>

          {filteredOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
              <Icon name="search_off" className="text-3xl mb-3" />
              <p className="font-headline italic text-xl text-tertiary mb-1">No orders match</p>
              <p className="text-sm">Try a different search or filter.</p>
            </div>
          )}

          {filteredOrders.map((order) => {
            const isSelected = selectedId === order.order_id;
            const itemNames = order.order_items
              .slice(0, 2)
              .map((i) => i.products?.name ?? "Item");
            if (order.order_items.length > 2)
              itemNames.push(`+${order.order_items.length - 2} more`);

            return (
              <div
                key={order.order_id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`Order from ${getDisplayName(order)}`}
                onClick={() => selectOrder(order.order_id)}
                onKeyDown={(e) =>
                  (e.key === "Enter" || e.key === " ") &&
                  selectOrder(order.order_id)
                }
                className={`p-6 rounded-xl transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                  isSelected
                    ? "bg-surface-container-lowest shadow-ambient"
                    : "bg-surface-container-low hover:bg-surface-container-highest/50"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div
                      className={`w-12 h-12 rounded-full ${AVATAR_BG[order.status]} flex items-center justify-center font-bold text-sm`}
                    >
                      {getInitials(order)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-on-surface">
                        {getDisplayName(order)}
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        Order #{order.order_id.slice(0, 8).toUpperCase()} &middot;{" "}
                        {getRelativeTime(order.order_date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 ${STATUS_STYLE[order.status]} text-[10px] uppercase font-bold tracking-widest rounded-full`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {itemNames.map((name) => (
                    <span
                      key={name}
                      className="px-2 py-1 bg-surface-container text-on-surface-variant text-xs rounded-md"
                    >
                      {name}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 bg-surface-container-low/30 -mx-6 px-6 -mb-6 pb-6 rounded-b-xl">
                  <p className="font-headline text-xl font-bold text-tertiary">
                    {formatCents(order.total_amount)}
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
        {selectedOrder && (
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
                    #{selectedOrder.order_id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Items */}
                {selectedOrder.order_items.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-secondary mb-4">
                      Items Ordered
                    </p>
                    <ul className="space-y-4">
                      {selectedOrder.order_items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden">
                              {item.products?.image_url ? (
                                <Image
                                  src={item.products.image_url}
                                  alt={item.products.name}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <Icon name="eco" className="text-primary" size="sm" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-on-surface">
                                {item.products?.name ?? "Product"}
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-bold">
                            {formatCents(item.unit_price * item.quantity)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Special Instructions */}
                {selectedOrder.special_instructions && (
                  <div className="bg-surface-container-low p-5 rounded-xl italic">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-2 not-italic">
                      Special Instructions
                    </p>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {selectedOrder.special_instructions}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    {NEXT_LABEL[selectedOrder.status] ? (
                      <button
                        onClick={handleAdvance}
                        disabled={pending}
                        className="flex-1 py-4 bg-primary text-on-primary rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {pending ? "Updating..." : NEXT_LABEL[selectedOrder.status]}
                      </button>
                    ) : (
                      <div className="flex-1 py-4 bg-surface-container text-on-surface-variant rounded-xl font-bold text-sm text-center capitalize">
                        {selectedOrder.status}
                      </div>
                    )}
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-4 bg-surface-container text-on-surface rounded-xl font-bold hover:bg-surface-container-low transition-colors"
                      aria-label="Print order"
                      title="Print order"
                    >
                      <Icon name="print" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center px-2">
                    {selectedOrder.status !== "cancelled" &&
                    selectedOrder.status !== "fulfilled" ? (
                      cancelState === "idle" ? (
                        <button
                          onClick={() => setCancelState("confirming")}
                          disabled={pending}
                          className="text-error text-xs font-bold uppercase tracking-wider hover:underline underline-offset-4 transition-colors disabled:opacity-60"
                        >
                          Cancel Order
                        </button>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-on-surface-variant font-body">
                            Are you sure?
                          </span>
                          <button
                            onClick={handleCancel}
                            disabled={pending}
                            className="text-error text-xs font-bold uppercase tracking-wider underline underline-offset-4 disabled:opacity-60"
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
                      )
                    ) : (
                      <span />
                    )}

                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                        Total Value
                      </p>
                      <p className="text-2xl font-headline font-bold text-tertiary">
                        {formatCents(selectedOrder.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
