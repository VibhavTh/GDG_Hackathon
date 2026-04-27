"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import { updateSiteSettings } from "./actions";

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

interface SiteData {
  name: string | null;
  description: string | null;
  location: string | null;
  image_url: string | null;
  categories: string[] | null;
  farmer_phone: string | null;
}

export function SiteSettingsForm({ site }: { site: SiteData | null }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(site?.image_url ?? null);
  const [imageUrl, setImageUrl] = useState<string>(site?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image must be under 5 MB. Please choose a smaller file.");
      e.target.value = "";
      return;
    }
    setFormError(null);
    setImagePreview(URL.createObjectURL(file));
    setImageUrl("");
    setFormSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(false);

    const formData = new FormData(e.currentTarget);
    const file = fileInputRef.current?.files?.[0];

    if (file) {
      setUploading(true);
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const filename = `farm-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filename, file, { upsert: false, contentType: file.type });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(uploadData.path);

        formData.set("image_url", publicUrl);
        setImageUrl(publicUrl);
      } catch {
        setFormError("Image upload failed. Make sure the product-images storage bucket exists and is public.");
        setUploading(false);
        setSubmitting(false);
        return;
      }
      setUploading(false);
    } else {
      formData.set("image_url", imageUrl);
    }

    const result = await updateSiteSettings(formData);
    setSubmitting(false);
    if (result?.error) {
      setFormError(result.error);
    } else {
      setFormSuccess(true);
    }
  }

  const isPending = submitting || uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {formError && (
        <div className="bg-error/10 text-error rounded-lg px-4 py-3 text-sm font-body flex items-start gap-3 animate-slide-down">
          <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}
      {formSuccess && (
        <div className="bg-primary/10 text-primary rounded-lg px-4 py-3 text-sm font-body flex items-start gap-3 animate-slide-down">
          <Icon name="check_circle" size="sm" className="mt-0.5 shrink-0" />
          <span>Changes saved successfully.</span>
        </div>
      )}

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
            defaultValue={site?.name ?? ""}
            placeholder="Green Market Farms"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="location" className={labelClass}>Location</label>
          <input
            id="location"
            name="location"
            type="text"
            defaultValue={site?.location ?? ""}
            placeholder="Blacksburg, VA"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className={labelClass}>Farm Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={site?.description ?? ""}
            placeholder="Tell customers about your farm, your growing practices, and what makes your products special..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Banner Image */}
        <div className="space-y-3">
          <p className={labelClass}>Banner Image</p>

          {imagePreview && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-surface-container-highest">
              <Image src={imagePreview} alt="Farm banner preview" fill className="object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageUrl("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 bg-surface/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-error/10 hover:text-error transition-colors"
              >
                <Icon name="close" size="sm" />
              </button>
            </div>
          )}

          <label
            htmlFor="image_file"
            className="flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            <Icon name="upload" className="text-on-surface-variant" />
            <span className="text-sm font-body text-on-surface-variant">
              {imagePreview ? "Replace banner" : "Upload banner image"}
            </span>
            <span className="text-xs text-on-surface-variant/50">JPG, PNG, WEBP up to 5MB</span>
            <input
              id="image_file"
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>

          <input type="hidden" name="image_url" value={imageUrl} readOnly />
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-surface-container-low p-8 rounded-xl space-y-6">
        <div>
          <h2 className="font-headline text-2xl text-tertiary mb-1">SMS Notifications</h2>
          <p className="text-xs text-on-surface-variant/60 font-body">Receive a text message when a new order comes in.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="farmer_phone" className={labelClass}>Your Phone Number</label>
          <input
            id="farmer_phone"
            name="farmer_phone"
            type="tel"
            defaultValue={site?.farmer_phone ?? ""}
            placeholder="+1 (540) 555-0100"
            className={inputClass}
          />
          <p className="text-xs text-on-surface-variant/50 font-body pt-1">
            Include country code (e.g. +1 for US). Leave blank to disable SMS alerts.
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
            const isChecked = (site?.categories ?? []).includes(cat.value);
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

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-on-primary font-label font-bold py-4 rounded-xl hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 uppercase tracking-widest text-sm disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {uploading ? (
          <><Icon name="progress_activity" size="sm" className="animate-spin" /> Uploading image...</>
        ) : submitting ? (
          <><Icon name="progress_activity" size="sm" className="animate-spin" /> Saving...</>
        ) : (
          "Save Changes"
        )}
      </button>
    </form>
  );
}
