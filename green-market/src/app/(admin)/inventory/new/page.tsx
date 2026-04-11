import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default function NewProductPage({ searchParams }: Props) {
  return (
    <Suspense fallback={null}>
      <NewProductContent searchParams={searchParams} />
    </Suspense>
  );
}

async function NewProductContent({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const { error } = await searchParams;

  return (
    <main className="flex-1">
      <ProductForm action={createProduct} error={error} />
    </main>
  );
}
