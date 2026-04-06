import type { OrderStatus } from "@/types/order";

const statusStyles: Record<OrderStatus, string> = {
  placed: "bg-surface-container-highest text-on-surface-variant",
  confirmed: "bg-primary-fixed text-on-primary-fixed",
  preparing: "bg-secondary-fixed text-on-secondary-fixed",
  ready: "bg-primary text-on-primary",
  fulfilled: "bg-primary-container text-on-primary-container",
  cancelled: "bg-error-container text-on-error-container",
  failed: "bg-error-container text-on-error-container",
  abandoned: "bg-surface-container-highest text-on-surface-variant",
};

const statusLabels: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
  failed: "Failed",
  abandoned: "Abandoned",
};

interface BadgeProps {
  status: OrderStatus;
}

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`
        px-3 py-1 rounded-full
        text-[10px] uppercase font-bold tracking-widest
        ${statusStyles[status]}
      `}
    >
      {statusLabels[status]}
    </span>
  );
}
