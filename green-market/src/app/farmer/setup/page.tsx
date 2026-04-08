import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { setupFarm } from "./actions";

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

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function FarmSetupPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/farmer/login");

  // If a farm with a name already exists, the farmer is already set up
  const service = createServiceClient();
  const { data: farm } = await service
    .from("farms")
    .select("name")
    .eq("owner_id", user.id)
    .single();

  if (farm?.name) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-surface">
      {/* Header */}
      <header className="px-6 py-4 flex items-center max-w-4xl mx-auto">
        <span className="font-headline italic text-xl text-tertiary">
          The Green Market Farm
        </span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Progress indicator */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Icon name="check" className="text-on-primary text-sm" />
          </div>
          <div className="h-[2px] flex-1 bg-primary" />
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-on-primary text-xs font-bold font-label">2</span>
          </div>
          <div className="h-[2px] flex-1 bg-outline-variant" />
          <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">
            <Icon name="storefront" className="text-on-surface-variant text-sm" />
          </div>
        </div>

        <div className="mb-10">
          <h1 className="font-headline italic text-4xl text-tertiary mb-3">
            Set up your farm
          </h1>
          <p className="text-on-surface-variant font-body">
            Tell customers what makes your farm special. You can update this
            anytime from settings.
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-error-container text-on-error-container rounded-lg px-4 py-3 text-sm font-body flex items-start gap-3">
            <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form action={setupFarm} className="space-y-10">
          {/* Farm Name */}
          <div className="space-y-2">
            <label
              htmlFor="farm_name"
              className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Farm Name <span className="text-secondary">*</span>
            </label>
            <input
              id="farm_name"
              name="farm_name"
              type="text"
              required
              placeholder="e.g. Sunrise Valley Farm"
              autoComplete="organization"
              className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label
              htmlFor="location"
              className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Farm Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              placeholder="e.g. Blacksburg, VA"
              autoComplete="address-level2"
              className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline"
            />
            <p className="text-xs text-on-surface-variant/60 font-body">
              Shown to customers browsing local farms
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
            >
              Farm Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Tell customers about your farm, your growing practices, and what makes your products special..."
              className="w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline resize-none"
            />
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <div>
              <p className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
                What do you sell?
              </p>
              <p className="text-xs text-on-surface-variant/60 font-body">
                Select all that apply
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map((cat) => (
                <label key={cat.value} className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    name="categories"
                    value={cat.value}
                    className="peer sr-only"
                  />
                  <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-outline-variant bg-surface-container-low transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary-fixed peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary">
                    <Icon
                      name={cat.icon}
                      size="sm"
                      className="text-on-surface-variant peer-checked:text-primary shrink-0"
                    />
                    <span className="text-sm font-label font-medium text-on-surface leading-tight">
                      {cat.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-label font-bold py-4 rounded-xl hover:bg-primary/90 active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm"
            >
              Create My Farm
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
