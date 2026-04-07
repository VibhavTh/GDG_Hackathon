"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/supabase/types";

// ---- helpers ----

async function getFarm() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/farmer/login");

  const { data: farmData } = await supabase
    .from("farms")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!farmData) redirect("/farmer/onboarding");
  const farm = farmData as { id: string };
  return { supabase, farmId: farm.id };
}

// ---- product CRUD ----

export async function createProduct(formData: FormData) {
  const { supabase, farmId } = await getFarm();

  const priceRaw = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  if (isNaN(priceRaw) || priceRaw < 0) {
    redirect(
      `/inventory/new?error=${encodeURIComponent("Please enter a valid price.")}`
    );
  }

  const { error } = await supabase.from("products").insert({
    farm_id: farmId,
    name: (formData.get("name") as string).trim(),
    description: (formData.get("description") as string).trim() || null,
    category: formData.get("category") as ProductCategory,
    price: Math.round(priceRaw * 100), // store in cents
    stock: isNaN(stock) ? 0 : stock,
    image_url: (formData.get("image_url") as string).trim() || null,
    is_active: true,
  });

  if (error) {
    redirect(
      `/inventory/new?error=${encodeURIComponent("Could not create product. Please try again.")}`
    );
  }

  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function updateProduct(formData: FormData) {
  const { supabase, farmId } = await getFarm();

  const productId = formData.get("product_id") as string;
  const priceRaw = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);

  const { error } = await supabase
    .from("products")
    .update({
      name: (formData.get("name") as string).trim(),
      description: (formData.get("description") as string).trim() || null,
      category: formData.get("category") as ProductCategory,
      price: Math.round(priceRaw * 100),
      stock: isNaN(stock) ? 0 : stock,
      image_url: (formData.get("image_url") as string).trim() || null,
    })
    .eq("id", productId)
    .eq("farm_id", farmId); // ownership check

  if (error) {
    redirect(
      `/inventory/${productId}/edit?error=${encodeURIComponent("Could not update product. Please try again.")}`
    );
  }

  revalidatePath("/inventory");
  redirect("/inventory");
}

export async function deleteProduct(productId: string) {
  const { supabase, farmId } = await getFarm();

  await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", productId)
    .eq("farm_id", farmId);

  revalidatePath("/inventory");
}

export async function restoreProduct(productId: string) {
  const { supabase, farmId } = await getFarm();

  await supabase
    .from("products")
    .update({ deleted_at: null, is_active: true })
    .eq("id", productId)
    .eq("farm_id", farmId);

  revalidatePath("/inventory");
}

export async function updateStock(productId: string, delta: number) {
  const { supabase, farmId } = await getFarm();

  // Read current stock, then apply delta — prevents going below 0
  const { data: product } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .eq("farm_id", farmId)
    .single();

  if (!product) return;

  const newStock = Math.max(0, product.stock + delta);

  await supabase
    .from("products")
    .update({ stock: newStock })
    .eq("id", productId)
    .eq("farm_id", farmId);

  revalidatePath("/inventory");
}
