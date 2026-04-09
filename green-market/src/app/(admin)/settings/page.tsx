import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/icon";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateFarmSettings } from "./actions";

const CATEGORIES = [
  { value: "produce", label: "Produce", icon: "local_florist" },
  { value: "baked_goods", label: "Baked Goods", icon: "bakery_dining" },
  { value: "dairy", label: "Dairy", icon: "water_drop" },
  { value: "eggs", label: "Eggs", icon: "egg" },
  { value: "meat", label: "Meat", icon: "kebab_dining" },
  { value: "honey_beeswax", label: "Honey & Beeswax", icon: "hive" },
  { value: "flowers", label: "Flowers", icon: "yard" },
  { value: "plants", label: "Plants", icon: "potted_plant" },
  { value: "handmade_crafts", label: "Handmade Crafts", icon: "handyman" },
  { value: "value_added", label: "Jams & Preserves", icon: "kitchen" },
  { value: "mushrooms", label: "Mushrooms", icon: "spa" },
  { value: "other", label: "Other", icon: "more_horiz" },
] as const;

const inputClass =
  "w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline";
const labelClass =
  "font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant";

interface Props {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function SettingsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/farmer/login");

  const service = createServiceClient();
  const { data: farm } = await service
    .from("farms")
    .select("name, description, location, image_url, categories")
    .eq("owner_id", user.id)
    .single();

  const { error, success } = await searchParams;

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

      {error && (
        <div className="mb-8 bg-error/10 text-error rounded-lg px-4 py-3 text-sm font-body flex items-start gap-3 animate-slide-down">
          <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-8 bg-primary/10 text-primary rounded-lg px-4 py-3 text-sm font-body flex items-start gap-3 animate-slide-down">
          <Icon name="check_circle" size="sm" className="mt-0.5 shrink-0" />
          <span>Changes saved successfully.</span>
        </div>
      )}

      <form action={updateFarmSettings} className="space-y-10">
        {/* Farm Profile */}
        <section className="bg-surface-container-low p-8 rounded-xl space-y-8">
          <h2 className="font-headline text-2xl text-tertiary">Farm Profile</h2>

          <div className="space-y-1.5">
            <label htmlFor="name" className={labelClass}>
              Farm Name <span className="text-error">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={farm?.name ?? ""}
              placeholder="e.g. Sunrise Valley Farm"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="location" className={labelClass}>
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={farm?.location ?? ""}
              placeholder="e.g. Blacksburg, VA"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className={labelClass}>
              Farm Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={farm?.description ?? ""}
              placeholder="Tell customers about your farm, your growing practices, and what makes your products special..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="image_url" className={labelClass}>
              Banner Image URL
            </label>
            <input
              id="image_url"
              name="image_url"
              type="url"
              defaultValue={farm?.image_url ?? ""}
              placeholder="https://..."
              className={inputClass}
            />
            <p className="text-xs text-on-surface-variant/60 font-body">
              Shown as the hero image on your public farm page.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-surface-container-low p-8 rounded-xl space-y-6">
          <div>
            <h2 className="font-headline text-2xl text-tertiary mb-1">What do you sell?</h2>
            <p className="text-xs text-on-surface-variant/60 font-body">Select all that apply</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const isChecked = (farm?.categories ?? []).includes(cat.value as never);
              return (
                <label key={cat.value} className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    name="categories"
                    value={cat.value}
                    defaultChecked={isChecked}
                    className="peer sr-only"
                  />
                  <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-outline-variant bg-surface-container-low transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary-fixed peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary active:scale-[0.97]">
                    <span className="material-symbols-outlined text-sm leading-none text-on-surface-variant shrink-0">
                      {cat.icon}
                    </span>
                    <span className="text-sm font-label font-medium text-on-surface leading-tight">
                      {cat.label}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        <SubmitButton label="Save Changes" loadingLabel="Saving..." />
      </form>
    </div>
  );
}
