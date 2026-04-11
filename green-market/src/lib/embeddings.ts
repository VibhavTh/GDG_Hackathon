import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Build the text string that gets embedded for a product.
 * Combining name + category + description gives the model enough
 * semantic signal to match natural-language queries like
 * "something sweet for breakfast".
 */
export function buildProductText(
  name: string,
  description: string | null,
  category: string
): string {
  const parts = [
    name,
    category.replace(/_/g, " "),
    description ?? "",
  ].filter(Boolean);
  return parts.join(". ");
}

/**
 * Uses Gemini to generate a semantically rich product description for embedding.
 * Includes color, texture, flavor, and use cases so that queries like "red"
 * map correctly to apples/tomatoes rather than color-adjacent products like oranges.
 * Falls back to plain buildProductText on any API failure.
 */
export async function enrichProductText(
  name: string,
  description: string | null,
  category: string
): Promise<string> {
  const base = buildProductText(name, description, category);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1" });
    const prompt = `You are indexing products for a farmer's market store.
Write a 2-3 sentence semantic description for this product for search indexing purposes.
Include: color, shape/texture, flavor profile, and common uses or meal contexts.
Be specific and factual. Do not invent details not implied by the product name or category.
Product name: ${name}
Category: ${category.replace(/_/g, " ")}
Description: ${description ?? "none provided"}
Return only the description text, no labels or formatting.`;
    const result = await model.generateContent(prompt);
    const enriched = result.response.text().trim();
    return enriched || base;
  } catch (err) {
    console.error("[enrichProductText] Gemini error:", err);
    return base;
  }
}

/**
 * Generate a 1536-dim embedding via text-embedding-3-small.
 * Returns null (and logs) on any API failure so callers can degrade gracefully.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text.trim(),
    });
    return res.data[0].embedding;
  } catch (err) {
    console.error("[generateEmbedding] OpenAI error:", err);
    return null;
  }
}
