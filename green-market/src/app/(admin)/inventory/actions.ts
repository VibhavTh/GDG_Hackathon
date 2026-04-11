"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/supabase/types";
import { enrichProductText, generateEmbedding } from "@/lib/embeddings";

// ---- helpers ----

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");
  return { service: createServiceClient() };
}

// ---- product CRUD ----

export async function createProduct(formData: FormData) {
  const { service } = await requireAuth();

  const priceRaw = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  if (isNaN(priceRaw) || priceRaw < 0) {
    redirect(
      `/inventory/new?error=${encodeURIComponent("Please enter a valid price.")}`
    );
  }

  const available_from = (formData.get("available_from") as string)?.trim() || null;
  const available_until = (formData.get("available_until") as string)?.trim() || null;

  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim() || null;
  const category = formData.get("category") as ProductCategory;

  const { data: created, error } = await service.from("products").insert({
    name,
    description,
    category,
    price: Math.round(priceRaw * 100),
    stock: isNaN(stock) ? 0 : stock,
    unit: (formData.get("unit") as string | null)?.trim() || "each",
    image_url: (formData.get("image_url") as string).trim() || null,
    is_active: true,
    is_organic: ["produce","baked_goods","dairy","eggs","meat","honey_beeswax","mushrooms","value_added"].includes(formData.get("category") as string) && formData.get("is_organic") === "true",
    available_from,
    available_until,
  }).select("id").single();

  if (error) {
    console.error("[createProduct] Supabase error:", JSON.stringify(error));
    redirect(
      `/inventory/new?error=${encodeURIComponent("Could not create product. Please try again.")}`
    );
  }

  // Generate and store embedding (non-blocking on failure -- product is already saved)
  if (created) {
    const embedding = await generateEmbedding(await enrichProductText(name, description, category));
    if (embedding) {
      await service
        .from("products")
        .update({ embedding: JSON.stringify(embedding), embedding_updated_at: new Date().toISOString() })
        .eq("id", created.id);
    }
  }

  updateTag("products");
  updateTag("dashboard");
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updateProduct(formData: FormData) {
  const { service } = await requireAuth();

  const productId = formData.get("product_id") as string;
  const priceRaw = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim() || null;
  const category = formData.get("category") as ProductCategory;

  const available_from = (formData.get("available_from") as string)?.trim() || null;
  const available_until = (formData.get("available_until") as string)?.trim() || null;

  const { error } = await service
    .from("products")
    .update({
      name,
      description,
      category,
      price: Math.round(priceRaw * 100),
      stock: isNaN(stock) ? 0 : stock,
      unit: (formData.get("unit") as string | null)?.trim() || "each",
      image_url: (formData.get("image_url") as string).trim() || null,
      is_organic: ["produce","baked_goods","dairy","eggs","meat","honey_beeswax","mushrooms","value_added"].includes(formData.get("category") as string) && formData.get("is_organic") === "true",
      available_from,
      available_until,
    })
    .eq("id", productId);

  if (error) {
    redirect(
      `/inventory/${productId}/edit?error=${encodeURIComponent("Could not update product. Please try again.")}`
    );
  }

  // Regenerate embedding to reflect any name/description/category changes
  const embedding = await generateEmbedding(await enrichProductText(name, description, category));
  if (embedding) {
    await service
      .from("products")
      .update({ embedding: JSON.stringify(embedding), embedding_updated_at: new Date().toISOString() })
      .eq("id", productId);
  }

  updateTag("products");
  updateTag("dashboard");
  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function deleteProduct(productId: string) {
  const { service } = await requireAuth();

  await service
    .from("products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", productId);

  updateTag("products");
  updateTag("dashboard");
  revalidatePath("/inventory");
}

export async function restoreProduct(productId: string) {
  const { service } = await requireAuth();

  await service
    .from("products")
    .update({ deleted_at: null, is_active: true })
    .eq("id", productId);

  updateTag("products");
  updateTag("dashboard");
  revalidatePath("/inventory");
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const { service } = await requireAuth();

  await service
    .from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", productId);

  updateTag("products");
  updateTag("dashboard");
  revalidatePath("/inventory");
}

export async function updateStock(productId: string, delta: number): Promise<boolean> {
  const { service } = await requireAuth();

  const { data: product } = await service
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single();

  if (!product) return false;

  const newStock = Math.max(0, (product as { stock: number }).stock + delta);
  const { error } = await service
    .from("products")
    .update({ stock: newStock })
    .eq("id", productId);

  if (error) {
    console.error("[updateStock] DB error:", error);
    return false;
  }

  updateTag("products");
  updateTag("dashboard");
  revalidatePath("/inventory");
  return true;
}
