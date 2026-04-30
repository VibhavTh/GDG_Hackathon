export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_messages: {
        Row: {
          archived_at: string | null
          body: string
          created_at: string
          from_email: string
          from_name: string | null
          id: string
          is_read: boolean
          metadata: Json
          read_at: string | null
          subject: string
          type: string
        }
        Insert: {
          archived_at?: string | null
          body: string
          created_at?: string
          from_email: string
          from_name?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json
          read_at?: string | null
          subject: string
          type: string
        }
        Update: {
          archived_at?: string | null
          body?: string
          created_at?: string
          from_email?: string
          from_name?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json
          read_at?: string | null
          subject?: string
          type?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_date: string
          event_time: string | null
          id: string
          is_published: boolean
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      newsletters: {
        Row: {
          body_html: string
          created_at: string
          created_by: string | null
          id: string
          recipient_count: number
          sent_at: string | null
          subject: string
        }
        Insert: {
          body_html: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipient_count?: number
          sent_at?: string | null
          subject: string
        }
        Update: {
          body_html?: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipient_count?: number
          sent_at?: string | null
          subject?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          metadata: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          customer_phone: string | null
          guest_email: string | null
          id: string
          order_number: string | null
          special_instructions: string | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customer_phone?: string | null
          guest_email?: string | null
          id?: string
          order_number?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customer_phone?: string | null
          guest_email?: string | null
          id?: string
          order_number?: string | null
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_webhooks: {
        Row: {
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          available_from: string | null
          available_until: string | null
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          deleted_at: string | null
          description: string | null
          embedding: string | null
          embedding_updated_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_organic: boolean
          name: string
          price: number
          stock: number
          tax_category: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_organic?: boolean
          name: string
          price: number
          stock?: number
          tax_category?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          embedding?: string | null
          embedding_updated_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_organic?: boolean
          name?: string
          price?: number
          stock?: number
          tax_category?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          categories: Database["public"]["Enums"]["product_category"][] | null
          description: string | null
          id: number
          image_url: string | null
          instagram_url: string | null
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          categories?: Database["public"]["Enums"]["product_category"][] | null
          description?: string | null
          id: number
          image_url?: string | null
          instagram_url?: string | null
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          categories?: Database["public"]["Enums"]["product_category"][] | null
          description?: string | null
          id?: number
          image_url?: string | null
          instagram_url?: string | null
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_order: {
        Args: {
          p_event_id: string
          p_order_id: string
          p_payment_intent_id: string
        }
        Returns: undefined
      }
      decrement_stock: { Args: { p_order_id: string }; Returns: undefined }
      search_products: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          available_from: string | null
          available_until: string | null
          category: Database["public"]["Enums"]["product_category"]
          description: string | null
          id: string
          image_url: string | null
          is_organic: boolean | null
          name: string
          price: number
          similarity: number
          stock: number
          unit: string | null
        }[]
      }
    }
    Enums: {
      notification_type:
        | "order_placed"
        | "order_fulfilled"
        | "order_cancelled"
        | "low_stock"
        | "farm_approved"
      order_status:
        | "pending_payment"
        | "placed"
        | "confirmed"
        | "preparing"
        | "ready"
        | "fulfilled"
        | "cancelled"
        | "failed"
        | "abandoned"
      product_category:
        | "vegetables"
        | "fruits"
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
        | "other"
      user_role: "customer" | "farmer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export type ProductCategory = Database["public"]["Enums"]["product_category"]
export type OrderStatus = Database["public"]["Enums"]["order_status"]
export type ProductRow = Database["public"]["Tables"]["products"]["Row"]

export const Constants = {
  public: {
    Enums: {
      notification_type: [
        "order_placed",
        "order_fulfilled",
        "order_cancelled",
        "low_stock",
        "farm_approved",
      ],
      order_status: [
        "pending_payment",
        "placed",
        "confirmed",
        "preparing",
        "ready",
        "fulfilled",
        "cancelled",
        "failed",
        "abandoned",
      ],
      product_category: [
        "vegetables",
        "fruits",
        "produce",
        "baked_goods",
        "dairy",
        "eggs",
        "meat",
        "honey_beeswax",
        "flowers",
        "plants",
        "handmade_crafts",
        "value_added",
        "mushrooms",
        "other",
      ],
      user_role: ["customer", "farmer", "admin"],
    },
  },
} as const
