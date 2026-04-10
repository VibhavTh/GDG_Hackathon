"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import type { ProductRow } from "@/lib/supabase/types";

const CATEGORIES = [
  { value: "produce", label: "Produce" },
  { value: "baked_goods", label: "Baked Goods" },
  { value: "dairy", label: "Dairy" },
  { value: "eggs", label: "Eggs" },
  { value: "meat", label: "Meat" },
  { value: "honey_beeswax", label: "Honey & Beeswax" },
  { value: "flowers", label: "Flowers" },
  { value: "plants", label: "Plants" },
  { value: "handmade_crafts", label: "Handmade Crafts" },
  { value: "value_added", label: "Jams & Preserves" },
  { value: "mushrooms", label: "Mushrooms" },
  { value: "other", label: "Other" },
] as const;

const UNITS = [
  { value: "each", label: "Each" },
  { value: "lb", label: "Per lb" },
  { value: "oz", label: "Per oz" },
  { value: "bunch", label: "Per bunch" },
  { value: "dozen", label: "Per dozen" },
  { value: "pint", label: "Per pint" },
  { value: "quart", label: "Per quart" },
  { value: "bag", label: "Per bag" },
  { value: "jar", label: "Per jar" },
  { value: "box", label: "Per box" },
];

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>;
  product?: ProductRow;
  error?: string;
}

const inputClass =
  "w-full bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 transition-all duration-300 py-3 px-0 font-body placeholder:text-outline";
const labelClass =
  "font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant";

export function ProductForm({ action, product, error }: ProductFormProps) {
  const isEdit = !!product;
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null);
  const [imageUrl, setImageUrl] = useState<string>(product?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(error ?? null);
  const [selectedCategory, setSelectedCategory] = useState<string>(product?.category ?? "produce");
  const [isOrganic, setIsOrganic] = useState<boolean>((product as (typeof product & { is_organic?: boolean }) | undefined)?.is_organic ?? false);
  const existingProduct = product as (typeof product & { available_from?: string | null; available_until?: string | null }) | undefined;

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
    // Clear the stored URL so the upload result takes over on submit
    setImageUrl("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const file = fileInputRef.current?.files?.[0];

    if (file) {
      setUploading(true);
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

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
        setFormError("Image upload failed. Check that the product-images storage bucket exists.");
        setUploading(false);
        setSubmitting(false);
        return;
      }
      setUploading(false);
    }

    await action(formData);
    setSubmitting(false);
  }

  const isPending = submitting || uploading;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href="/inventory"
        className="inline-flex items-center gap-2 text-xs font-label uppercase tracking-wider text-on-surface-variant/60 hover:text-primary transition-colors mb-10"
      >
        <Icon name="arrow_back" size="sm" />
        Back to inventory
      </Link>

      <h1 className="font-headline italic text-4xl text-tertiary mb-2">
        {isEdit ? "Edit Product" : "New Product"}
      </h1>
      <p className="text-on-surface-variant font-body mb-10">
        {isEdit
          ? "Update your listing details below."
          : "Fill in the details to add a new product to your storefront."}
      </p>

      {formError && (
        <div className="mb-8 bg-error/10 text-error rounded-lg px-4 py-3 text-sm font-body flex items-start gap-3 animate-slide-down">
          <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        {isEdit && <input type="hidden" name="product_id" value={product.id} />}

        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className={labelClass}>
            Product Name <span className="text-error">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={product?.name ?? ""}
            placeholder="e.g. Rainbow Heirloom Carrots"
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
            placeholder="What makes this product special? Growing method, flavor notes, suggested use..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Category + Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-1.5">
            <label htmlFor="category" className={labelClass}>
              Category <span className="text-error">*</span>
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={product?.category ?? "produce"}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="unit" className={labelClass}>Unit</label>
            <select
              id="unit"
              name="unit"
              defaultValue={product?.unit ?? "each"}
              className={`${inputClass} cursor-pointer`}
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Organic — visible for food/agricultural categories */}
        {["produce", "baked_goods", "dairy", "eggs", "meat", "honey_beeswax", "mushrooms", "value_added"].includes(selectedCategory) && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={isOrganic}
              onClick={() => setIsOrganic((v) => !v)}
              className={`w-5 h-5 rounded-[var(--radius-sm)] border-2 flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer ${
                isOrganic ? "bg-primary border-primary" : "border-outline-variant bg-surface-container-lowest"
              }`}
            >
              {isOrganic && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <div>
              <p className={labelClass}>Certified Organic</p>
              <p className="text-xs text-on-surface-variant mt-0.5">This produce is grown without synthetic pesticides or fertilizers</p>
            </div>
            <input type="hidden" name="is_organic" value={isOrganic ? "true" : "false"} />
          </div>
        )}

        {/* Price + Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-1.5">
            <label htmlFor="price" className={labelClass}>
              Price (USD) <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-0 top-3 text-on-surface-variant font-body">$</span>
              <input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                defaultValue={product ? (product.price / 100).toFixed(2) : ""}
                placeholder="0.00"
                className={`${inputClass} pl-4`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="stock" className={labelClass}>Stock</label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.stock ?? 0}
              placeholder="0"
              className={inputClass}
            />
          </div>
        </div>

        {/* Seasonal availability */}
        <div className="space-y-1.5">
          <p className={labelClass}>Seasonal Availability <span className="font-normal normal-case tracking-normal text-on-surface-variant">(optional)</span></p>
          <p className="text-xs text-on-surface-variant mb-2">Leave blank to always show. Set dates to auto-show "Coming in [Month]" badges and hide the product when out of season.</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label htmlFor="available_from" className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant">Available From</label>
              <input
                id="available_from"
                name="available_from"
                type="date"
                defaultValue={existingProduct?.available_from ?? ""}
                className={inputClass}
                style={{ accentColor: "#173809", colorScheme: "light" }}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="available_until" className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant">Available Until</label>
              <input
                id="available_until"
                name="available_until"
                type="date"
                defaultValue={existingProduct?.available_until ?? ""}
                className={inputClass}
                style={{ accentColor: "#173809", colorScheme: "light" }}
              />
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div className="space-y-3">
          <p className={labelClass}>Product Image</p>

          {/* Preview */}
          {imagePreview && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-surface-container-highest">
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
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

          {/* File input drop area */}
          <label
            htmlFor="image_file"
            className="flex flex-col items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            <Icon name="upload" className="text-on-surface-variant" />
            <span className="text-sm font-body text-on-surface-variant">
              {imagePreview ? "Replace image" : "Upload image"}
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

          {/* Hidden URL field -- controlled via state so remove/upload always reflects correctly */}
          <input
            type="hidden"
            name="image_url"
            value={imageUrl}
            readOnly
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 bg-primary text-on-primary font-label font-bold py-4 rounded-xl hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 uppercase tracking-widest text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><Icon name="progress_activity" size="sm" className="animate-spin" /> Uploading...</>
            ) : submitting ? (
              <><Icon name="progress_activity" size="sm" className="animate-spin" /> Saving...</>
            ) : (
              isEdit ? "Save Changes" : "Add to Inventory"
            )}
          </button>
          <Link
            href="/inventory"
            className="px-8 py-4 bg-surface-container-highest text-on-surface font-label font-bold rounded-xl hover:bg-surface-variant active:scale-[0.97] transition-all duration-150 uppercase tracking-widest text-sm text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
