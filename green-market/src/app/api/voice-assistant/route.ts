import { NextRequest, NextResponse } from "next/server";
import { generateText, zodSchema } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  runUpdateStock,
  runSetStockAbsolute,
  runToggleProductActive,
  runDeleteProduct,
  runAdvanceOrderStatus,
  runCancelOrder,
  runQueryOrders,
  runQueryInventory,
  runQueryRevenue,
} from "@/lib/voice-assistant/tool-runner";
import type {
  VoiceAssistantRequest,
  VoiceAssistantResponse,
  PendingConfirmation,
} from "@/lib/voice-assistant/types";

// Tools that require spoken confirmation before execution
const CONFIRMATION_TOOLS = new Set(["deleteProduct", "cancelOrder"]);

const SYSTEM_PROMPT = `You are a voice assistant for a small family farm's admin dashboard.
The farmer speaks commands to you and you help manage their inventory and orders.
Keep replies under 2 sentences -- they will be spoken aloud.
Never use technical jargon.
You CANNOT create new products. If asked to add or create a product, say: "New listings need a photo, so please add that one manually from the Inventory page."
When asked about products or inventory, ALWAYS call the queryInventory tool to get current data -- never guess or repeat a previous answer.
When asked a follow-up question like "what is that?" or "can you name them?", call queryInventory again to fetch the full list with names.
Today's date is ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.`;

const CONFIRM_PHRASES = new Set(["yes", "yeah", "yep", "confirm", "do it", "go ahead", "sure", "ok", "okay"]);
const CANCEL_PHRASES = new Set(["no", "nope", "cancel", "stop", "never mind", "don't"]);

function normalize(text: string) {
  return text.toLowerCase().trim().replace(/[.,!?]/g, "");
}

export async function POST(request: NextRequest): Promise<NextResponse<VoiceAssistantResponse>> {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ spokenReply: "Please sign in first.", error: "Unauthorized" }, { status: 401 });
  }

  let body: VoiceAssistantRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ spokenReply: "I couldn't understand that request.", error: "Invalid JSON" }, { status: 400 });
  }

  const { transcript, conversationHistory = [], pendingConfirmation } = body;
  const normalizedTranscript = normalize(transcript);

  // Handle pending confirmation flow
  if (pendingConfirmation) {
    if (CONFIRM_PHRASES.has(normalizedTranscript) || normalizedTranscript.startsWith("yes")) {
      try {
        const reply = await executeTool(pendingConfirmation.toolName, pendingConfirmation.toolArgs);
        return NextResponse.json({ spokenReply: reply, toolInvoked: pendingConfirmation.toolName });
      } catch (err) {
        console.error("[voice-assistant] confirmed tool execution failed:", err);
        return NextResponse.json({ spokenReply: "Something went wrong. Please try again.", error: String(err) });
      }
    }
    if (CANCEL_PHRASES.has(normalizedTranscript) || normalizedTranscript.startsWith("no")) {
      return NextResponse.json({ spokenReply: "Cancelled." });
    }
  }

  // Build messages for LLM
  const messages: { role: "user" | "assistant"; content: string }[] = conversationHistory
    .slice(-6)
    .map((turn) => ({ role: turn.role, content: turn.content }));

  messages.push({ role: "user", content: transcript });

  try {
    const result = await generateText({
      model: anthropic("claude-haiku-4-5"),
      system: SYSTEM_PROMPT,
      messages,
      tools: buildTools(),
    });

    // Check if LLM invoked a tool
    if (result.toolCalls && result.toolCalls.length > 0) {
      const toolCall = result.toolCalls[0];
      const toolName = toolCall.toolName;
      // In AI SDK v6, tool input is in toolCall.input
      const toolArgs = ("input" in toolCall ? toolCall.input : (toolCall as unknown as { args: Record<string, unknown> }).args) as Record<string, unknown>;

      // Dangerous tools need confirmation
      if (CONFIRMATION_TOOLS.has(toolName)) {
        const description = buildConfirmationDescription(toolName, toolArgs);
        const confirmation: PendingConfirmation = { toolName, toolArgs, description };
        return NextResponse.json({
          spokenReply: description,
          requiresConfirmation: confirmation,
        });
      }

      // Execute safe tool
      const reply = await executeTool(toolName, toolArgs);
      return NextResponse.json({ spokenReply: reply, toolInvoked: toolName });
    }

    // LLM returned plain text (gathering more info, etc.)
    const spokenReply = result.text || "I didn't quite catch that. Could you repeat?";
    return NextResponse.json({ spokenReply });

  } catch (err) {
    console.error("[voice-assistant] LLM error:", err);
    return NextResponse.json(
      { spokenReply: "Something went wrong. Please try again.", error: String(err) },
      { status: 500 }
    );
  }
}

// Fetch product names for Deepgram keyword hints
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ keywords: [] }, { status: 401 });
  }

  const { createServiceClient } = await import("@/lib/supabase/server");
  const service = createServiceClient();
  const { data } = await service
    .from("products")
    .select("name")
    .is("deleted_at", null)
    .eq("is_active", true);

  const keywords = (data ?? []).map((p: { name: string }) => p.name);
  return NextResponse.json({ keywords });
}

function buildConfirmationDescription(toolName: string, args: Record<string, unknown>): string {
  if (toolName === "deleteProduct") {
    return `Are you sure you want to delete ${args.productName}? Say yes to confirm or no to cancel.`;
  }
  if (toolName === "cancelOrder") {
    return `Are you sure you want to cancel and refund order ${args.orderId}? Say yes to confirm or no to cancel.`;
  }
  return "Are you sure? Say yes to confirm or no to cancel.";
}

async function executeTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  const a = args as Record<string, unknown>;
  switch (toolName) {
    case "updateStock":
      return runUpdateStock({ productName: a.productName as string, delta: a.delta as number });
    case "setStockAbsolute":
      return runSetStockAbsolute({ productName: a.productName as string, quantity: a.quantity as number });
    case "toggleProductActive":
      return runToggleProductActive({ productName: a.productName as string, active: a.active as boolean });
    case "deleteProduct":
      return runDeleteProduct({ productName: a.productName as string });
    case "advanceOrderStatus":
      return runAdvanceOrderStatus({ orderId: a.orderId as string });
    case "cancelOrder":
      return runCancelOrder({ orderId: a.orderId as string });
    case "queryOrders":
      return runQueryOrders({
        filter: a.filter as import("@/lib/voice-assistant/types").QueryOrdersArgs["filter"],
        status: a.status as import("@/lib/supabase/types").OrderStatus | undefined,
      });
    case "queryInventory":
      return runQueryInventory({
        filter: a.filter as import("@/lib/voice-assistant/types").QueryInventoryArgs["filter"],
        productName: a.productName as string | undefined,
      });
    case "queryRevenue":
      return runQueryRevenue({ period: a.period as "today" | "this_week" | "this_month" });
    default:
      return "I don't know how to do that yet.";
  }
}

function buildTools() {
  return {
    updateStock: {
      description: "Adjust a product's stock by a delta amount (positive to add, negative to subtract). Use when farmer says 'add 10 tomatoes', 'I sold 5 eggs'.",
      inputSchema: zodSchema(z.object({
        productName: z.string().describe("The product name to update"),
        delta: z.number().describe("Amount to add (positive) or remove (negative)"),
      })),
    },
    setStockAbsolute: {
      description: "Set a product's stock to an exact quantity. Use when farmer says 'set honey to 20'.",
      inputSchema: zodSchema(z.object({
        productName: z.string().describe("The product name to update"),
        quantity: z.number().int().min(0).describe("The exact stock quantity to set"),
      })),
    },
    toggleProductActive: {
      description: "Show or hide a product listing on the storefront. Use when farmer says 'take herbs off the store' or 'put tomatoes back on'.",
      inputSchema: zodSchema(z.object({
        productName: z.string().describe("The product name to toggle"),
        active: z.boolean().describe("true to show, false to hide"),
      })),
    },
    deleteProduct: {
      description: "Soft-delete a product. This ALWAYS requires confirmation first -- the system will ask the farmer to confirm.",
      inputSchema: zodSchema(z.object({
        productName: z.string().describe("The product name to delete"),
      })),
    },
    advanceOrderStatus: {
      description: "Move an order to the next status in the lifecycle (placed -> confirmed -> preparing -> ready -> fulfilled). If order status is ready, an SMS is sent to the customer.",
      inputSchema: zodSchema(z.object({
        orderId: z.string().describe("The order ID (UUID)"),
      })),
    },
    cancelOrder: {
      description: "Cancel an order and issue a Stripe refund. This ALWAYS requires confirmation first.",
      inputSchema: zodSchema(z.object({
        orderId: z.string().describe("The order ID (UUID)"),
      })),
    },
    queryOrders: {
      description: "Look up orders. Use when farmer asks 'what orders need fulfilling', 'how many orders today'.",
      inputSchema: zodSchema(z.object({
        filter: z.enum(["needs_fulfilling", "today", "all"]).optional().describe("Filter type"),
        status: z.enum([
          "pending_payment", "placed", "confirmed", "preparing",
          "ready", "fulfilled", "cancelled", "failed", "abandoned"
        ]).optional().describe("Filter by specific status"),
      })),
    },
    queryInventory: {
      description: "Check stock levels. Use when farmer asks 'what's low stock', 'how much honey do I have'.",
      inputSchema: zodSchema(z.object({
        filter: z.enum(["low_stock", "all"]).optional().describe("Filter type"),
        productName: z.string().optional().describe("Specific product name to check"),
      })),
    },
    queryRevenue: {
      description: "Get revenue totals. Use when farmer asks 'today's revenue', 'this week's total'.",
      inputSchema: zodSchema(z.object({
        period: z.enum(["today", "this_week", "this_month"]).describe("Time period for revenue"),
      })),
    },
  };
}
