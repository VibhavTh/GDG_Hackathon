import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewProductPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/farmer/login");

  const { error } = await searchParams;

  return (
    <main className="flex-1">
      <ProductForm action={createProduct} error={error} />
    </main>
  );
}
