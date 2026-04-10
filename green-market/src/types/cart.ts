export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
}

export interface Cart {
  items: CartItem[];
  specialInstructions: string;
}
