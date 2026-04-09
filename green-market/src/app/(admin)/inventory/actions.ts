"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/supabase/types";

// ---- helpers ----

async function getFarm() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const service = createServiceClient();
  const { data: farmData } = await service
    .from("farms")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!farmData) redirect("/vendor/setup");
  const farm = farmData as { id: string };
  return { service, farmId: farm.id };
}

// ---- product CRUD ----

export async function createProduct(formData: FormData) {
  const { service, farmId } = await getFarm();

  const priceRaw = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  if (isNaN(priceRaw) || priceRaw < 0) {
    redirect(
      `/inventory/new?error=${encodeURIComponent("Please enter a valid price.")}`
    );
  }

  const { error } = await service.from("products").insert({
    farm_id: farmId,
    name: (formData.get("name") as string).trim(),
    description: (formData.get("description") as string).trim() || null,
    category: formData.get("category") as ProductCategory,
    price: Math.round(priceRaw * 100),
    stock: isNaN(stock) ? 0 : stock,
    unit: (formData.get("unit") as string | null)?.trim() || "each",
    image_url: (formData.get("image_url") as string).trim() || null,
    is_active: true,
    is_organic: ["produce","baked_goods","dairy","eggs","meat","honey_beeswax","mushrooms","value_added"].includes(formData.get("category") as string) && formData.get("is_organic") === "true",
  });

  if (error) {
    console.error("[createProduct] Supabase error:", JSON.stringify(error));
    redirect(
      `/inventory/new?error=${encodeURIComponent("Could not create product. Please try again.")}`
    );
  }

  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updateProduct(formData: FormData) {
  const { service, farmId } = await getFarm();

  const productId = formData.get("product_id") as string;
  const priceRaw = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  const { error } = await service
    .from("products")
    .update({
      name: (formData.get("name") as string).trim(),
      description: (formData.get("description") as string).trim() || null,
      category: formData.get("category") as ProductCategory,
      price: Math.round(priceRaw * 100),
      stock: isNaN(stock) ? 0 : stock,
      unit: (formData.get("unit") as string | null)?.trim() || "each",
      image_url: (formData.get("image_url") as string).trim() || null,
      is_organic: ["produce","baked_goods","dairy","eggs","meat","honey_beeswax","mushrooms","value_added"].includes(formData.get("category") as string) && formData.get("is_organic") === "true",
    })
    .eq("id", productId)
    .eq("farm_id", farmId);

  if (error) {
    redirect(
      `/inventory/${productId}/edit?error=${encodeURIComponent("Could not update product. Please try again.")}`
    );
  }

  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function deleteProduct(productId: string) {
  const { service, farmId } = await getFarm();

  await service
    .from("products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", productId)
    .eq("farm_id", farmId);

  revalidatePath("/inventory");
}

export async function restoreProduct(productId: string) {
  const { service, farmId } = await getFarm();

  await service
    .from("products")
    .update({ deleted_at: null, is_active: true })
    .eq("id", productId)
    .eq("farm_id", farmId);

  revalidatePath("/inventory");
}

export async function toggleProductActive(productId: string, isActive: boolean) {
  const { service, farmId } = await getFarm();

  await service
    .from("products")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .eq("farm_id", farmId);

  revalidatePath("/inventory");
}

export async function updateStock(productId: string, delta: number): Promise<boolean> {
  const { service, farmId } = await getFarm();

  const { data: product } = await service
    .from("products")
    .select("stock")
    .eq("id", productId)
    .eq("farm_id", farmId)
    .single();

  if (!product) return false;

  const newStock = Math.max(0, (product as { stock: number }).stock + delta);
  const { error } = await service
    .from("products")
    .update({ stock: newStock })
    .eq("id", productId)
    .eq("farm_id", farmId);

  if (error) {
    console.error("[updateStock] DB error:", error);
    return false;
  }

  revalidatePath("/inventory");
  return true;
}
