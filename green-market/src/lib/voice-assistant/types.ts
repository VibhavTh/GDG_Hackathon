import type { OrderStatus } from "@/lib/supabase/types";

export type ConversationRole = "user" | "assistant";

export interface ConversationTurn {
  role: ConversationRole;
  content: string;
}

export interface PendingConfirmation {
  toolName: string;
  toolArgs: Record<string, unknown>;
  /** Human-readable description to speak before asking for confirmation */
  description: string;
}

export interface VoiceAssistantRequest {
  transcript: string;
  conversationHistory: ConversationTurn[];
  pendingConfirmation?: PendingConfirmation;
}

export interface VoiceAssistantResponse {
  spokenReply: string;
  toolInvoked?: string;
  requiresConfirmation?: PendingConfirmation;
  error?: string;
}

// Tool argument shapes
export interface UpdateStockArgs {
  productName: string;
  delta: number;
}

export interface SetStockAbsoluteArgs {
  productName: string;
  quantity: number;
}

export interface ToggleProductActiveArgs {
  productName: string;
  active: boolean;
}

export interface DeleteProductArgs {
  productName: string;
}

export interface AdvanceOrderStatusArgs {
  orderId: string;
}

export interface CancelOrderArgs {
  orderId: string;
}

export interface QueryOrdersArgs {
  filter?: "needs_fulfilling" | "today" | "all";
  status?: OrderStatus;
}

export interface QueryInventoryArgs {
  filter?: "low_stock" | "all";
  productName?: string;
}

export interface QueryRevenueArgs {
  period: "today" | "this_week" | "this_month";
}
