export type OrderStatus =
  | "pending_payment"
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "fulfilled"
  | "cancelled"
  | "failed"
  | "abandoned";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  status: OrderStatus;
  items: OrderItem[];
  specialInstructions: string | null;
  total: number;
  fulfillmentFee: number;
  fulfillmentType: "delivery" | "pickup";
  stripePaymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
}
