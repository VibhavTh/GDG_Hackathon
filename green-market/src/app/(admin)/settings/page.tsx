import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { SiteSettingsForm } from "./site-settings-form";

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor/login");

  const site = await getSiteSettings();

  return (
    <div className="p-6 md:p-12 max-w-3xl">
      <header className="mb-10">
        <h1 className="text-4xl font-headline italic text-tertiary">
          Farm Settings
        </h1>
        <p className="text-on-surface-variant mt-2 font-body">
          Update your farm profile. Changes appear on your storefront immediately.
        </p>
      </header>

      <SiteSettingsForm site={site ?? null} />
    </div>
  );
}
