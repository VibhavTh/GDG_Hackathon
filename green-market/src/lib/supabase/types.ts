export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "farmer" | "admin";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "fulfilled"
  | "cancelled"
  | "failed"
  | "abandoned";
export type ProductCategory =
  | "produce"
  | "baked_goods"
  | "dairy"
  | "eggs"
  | "meat"
  | "honey_beeswax"
  | "flowers"
  | "plants"
  | "handmade_crafts"
  | "value_added"
  | "mushrooms"
  | "other";
export type NotificationType =
  | "order_placed"
  | "order_fulfilled"
  | "order_cancelled"
  | "low_stock"
  | "farm_approved";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          role?: UserRole;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      farms: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          location: string | null;
          image_url: string | null;
          categories: ProductCategory[];
          stripe_account_id: string | null;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          location?: string | null;
          image_url?: string | null;
          categories?: ProductCategory[];
          stripe_account_id?: string | null;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          location?: string | null;
          image_url?: string | null;
          categories?: ProductCategory[];
          stripe_account_id?: string | null;
          is_approved?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          farm_id: string;
          name: string;
          description: string | null;
          category: ProductCategory;
          tax_category: string | null;
          price: number;
          stock: number;
          image_url: string | null;
          embedding: number[] | null;
          embedding_updated_at: string | null;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          name: string;
          description?: string | null;
          category?: ProductCategory;
          tax_category?: string | null;
          price: number;
          stock?: number;
          image_url?: string | null;
          embedding?: number[] | null;
          embedding_updated_at?: string | null;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          category?: ProductCategory;
          tax_category?: string | null;
          price?: number;
          stock?: number;
          image_url?: string | null;
          embedding?: number[] | null;
          embedding_updated_at?: string | null;
          is_active?: boolean;
          deleted_at?: string | null;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string | null;
          guest_email: string | null;
          stripe_session_id: string | null;
          stripe_payment_intent: string | null;
          total_amount: number;
          status: OrderStatus;
          special_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          guest_email?: string | null;
          stripe_session_id?: string | null;
          stripe_payment_intent?: string | null;
          total_amount: number;
          status?: OrderStatus;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: OrderStatus;
          stripe_session_id?: string | null;
          stripe_payment_intent?: string | null;
          special_instructions?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          farm_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          farm_id: string;
          quantity: number;
          unit_price: number;
          created_at?: string;
        };
        Update: never;
      };
      processed_webhooks: {
        Row: {
          stripe_event_id: string;
          processed_at: string;
        };
        Insert: {
          stripe_event_id: string;
          processed_at?: string;
        };
        Update: never;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          is_read: boolean;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body?: string | null;
          is_read?: boolean;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: {
      farm_order_summary: {
        Row: {
          farm_id: string;
          order_id: string;
          customer_id: string | null;
          guest_email: string | null;
          status: OrderStatus;
          order_date: string;
          farm_subtotal: number;
          items: Json;
        };
      };
    };
    Functions: {
      search_products: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
        };
        Returns: {
          id: string;
          farm_id: string;
          name: string;
          description: string | null;
          category: ProductCategory;
          price: number;
          stock: number;
          image_url: string | null;
          similarity: number;
        }[];
      };
      decrement_stock: {
        Args: { p_order_id: string };
        Returns: void;
      };
    };
  };
}

// Convenience row types
export type UserRow = Database["public"]["Tables"]["users"]["Row"];
export type FarmRow = Database["public"]["Tables"]["farms"]["Row"];
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];
