import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { FarmSettingsForm } from "./farm-settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/farmer/login");

  const service = createServiceClient();
  const { data: farm } = await service
    .from("farms")
    .select("name, description, location, image_url, categories")
    .eq("owner_id", user.id)
    .single();

  return (
    <div className="p-6 md:p-12 max-w-3xl">
      <header className="mb-10">
        <h1 className="text-4xl font-headline italic text-tertiary">
          Farm Settings
        </h1>
        <p className="text-on-surface-variant mt-2 font-body">
          Update your farm profile. Changes appear on your public farm page immediately.
        </p>
      </header>

      <FarmSettingsForm farm={farm ?? null} />
    </div>
  );
}
