import { notFound, redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "../../actions";
import type { ProductRow } from "@/lib/supabase/types";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditProductPage({ params, searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const { id } = await params;
  const { error } = await searchParams;

  const service = createServiceClient();

  const { data: productData } = await service
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!productData) notFound();
  const product = productData as ProductRow;

  // Verify ownership via farm
  const { data: farm } = await service
    .from("farms")
    .select("id")
    .eq("id", product.farm_id as string)
    .eq("owner_id", user.id)
    .single();

  if (!farm) notFound();

  return (
    <main className="flex-1">
      <ProductForm action={updateProduct} product={product} error={error} />
    </main>
  );
}
