"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { createClient } from "@/lib/supabase/client";
import type { ProductRow } from "@/lib/supabase/types";

const CATEGORIES = [
  { value: "fruits", label: "Fruits" },
  { value: "vegetables", label: "Vegetables" },
  { value: "flowers", label: "Annual Flowers" },
  { value: "plants", label: "Perennial Flowers" },
  { value: "baked_goods", label: "Baked Goods" },
  { value: "dairy", label: "Dairy" },
  { value: "eggs", label: "Eggs" },
  { value: "meat", label: "Meat" },
  { value: "honey_beeswax", label: "Honey & Beeswax" },
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
  const [selectedCategory, setSelectedCategory] = useState<string>(product?.category ?? "vegetables");
  const [isOrganic, setIsOrganic] = useState<boolean>((product as (typeof product & { is_organic?: boolean }) | undefined)?.is_organic ?? false);
  const existingProduct = product as (typeof product & { available_from?: string | null; available_until?: string | null }) | undefined;

  // AI prefill state
  const [analyzing, setAnalyzing] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);
  const [nameValue, setNameValue] = useState(product?.name ?? "");
  const [descValue, setDescValue] = useState(product?.description ?? "");
  const [unitValue, setUnitValue] = useState(product?.unit ?? "each");
  const [priceValue, setPriceValue] = useState(product ? (product.price / 100).toFixed(2) : "");
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  function clearAiField(field: string) {
    setAiFilledFields((prev) => { const n = new Set(prev); n.delete(field); return n; });
  }

  async function analyzeImage() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    setFormError(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/analyze-product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Image analysis failed."); return; }
      const filled = new Set<string>();
      if (data.summary) setAiSummary(data.summary);
      if (data.name) { setNameValue(data.name); filled.add("name"); }
      if (data.description) { setDescValue(data.description); filled.add("description"); }
      if (data.unit) { setUnitValue(data.unit); filled.add("unit"); }
      if (data.price) { setPriceValue(String(data.price)); filled.add("price"); }
      if (data.category) { setSelectedCategory(data.category); filled.add("category"); }
      if (data.is_organic !== undefined) { setIsOrganic(Boolean(data.is_organic)); filled.add("organic"); }
      setAiFilledFields(filled);
      setAiApplied(true);
    } catch {
      setFormError("Image analysis failed. Please fill in details manually.");
    } finally {
      setAnalyzing(false);
    }
  }

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

      {aiSummary && (
        <div className="mb-8 bg-primary/8 rounded-xl px-5 py-4 flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">✨</span>
          <p className="text-sm font-body text-on-surface leading-relaxed">{aiSummary}</p>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        {isEdit && <input type="hidden" name="product_id" value={product.id} />}

        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className={labelClass}>
            Product Name <span className="text-error">*</span>
            {aiFilledFields.has("name") && <span className="ml-1.5 text-base" title="AI suggested">✨</span>}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={nameValue}
            onChange={(e) => { setNameValue(e.target.value); clearAiField("name"); }}
            placeholder="e.g. Rainbow Heirloom Carrots"
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className={labelClass}>
            Description
            {aiFilledFields.has("description") && <span className="ml-1.5 text-base" title="AI suggested">✨</span>}
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={descValue}
            onChange={(e) => { setDescValue(e.target.value); clearAiField("description"); }}
            placeholder="What makes this product special? Growing method, flavor notes, suggested use..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Category + Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-1.5">
            <label htmlFor="category" className={labelClass}>
              Category <span className="text-error">*</span>
              {aiFilledFields.has("category") && <span className="ml-1.5 text-base" title="AI suggested">✨</span>}
            </label>
            <select
              id="category"
              name="category"
              required
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); clearAiField("category"); }}
              className={`${inputClass} cursor-pointer`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="unit" className={labelClass}>
              Unit
              {aiFilledFields.has("unit") && <span className="ml-1.5 text-base" title="AI suggested">✨</span>}
            </label>
            <select
              id="unit"
              name="unit"
              value={unitValue}
              onChange={(e) => { setUnitValue(e.target.value); clearAiField("unit"); }}
              className={`${inputClass} cursor-pointer`}
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Organic — visible for food/agricultural categories */}
        {["vegetables", "fruits", "produce", "baked_goods", "dairy", "eggs", "meat", "honey_beeswax", "mushrooms", "value_added"].includes(selectedCategory) && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="checkbox"
              aria-checked={isOrganic}
              onClick={() => { setIsOrganic((v) => !v); clearAiField("organic"); }}
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
              <p className={labelClass}>
                Sustainably Grown
                {aiFilledFields.has("organic") && <span className="ml-1.5 text-base" title="AI suggested">✨</span>}
              </p>
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
              {aiFilledFields.has("price") && <span className="ml-1.5 text-base" title="AI suggested">✨</span>}
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
                value={priceValue}
                onChange={(e) => { setPriceValue(e.target.value); clearAiField("price"); }}
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

          {/* AI analysis banner -- only on new product, only when an image is selected */}
          {!isEdit && imagePreview && (
            <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-body ${
              aiApplied
                ? "bg-primary/8 text-primary"
                : "bg-surface-container text-on-surface-variant"
            }`}>
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <Icon name="progress_activity" size="sm" className="animate-spin shrink-0" />
                  Analyzing image...
                </span>
              ) : aiApplied ? (
                <>
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true">✨</span>
                    AI filled the fields below. Review and edit before saving.
                  </span>
                  <button
                    type="button"
                    onClick={() => setAiApplied(false)}
                    className="shrink-0 p-1 rounded hover:bg-primary/10 transition-colors"
                    aria-label="Dismiss"
                  >
                    <Icon name="close" size="sm" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true">✨</span>
                    Want AI to fill in the details?
                  </span>
                  <button
                    type="button"
                    onClick={analyzeImage}
                    className="shrink-0 px-4 py-1.5 rounded-full bg-primary text-on-primary text-xs font-label font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                  >
                    Analyze Image
                  </button>
                </>
              )}
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
