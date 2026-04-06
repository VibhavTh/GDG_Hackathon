export type OrderStatus =
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
  farmId: string;
  customerName: string;
  customerEmail: string;
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
