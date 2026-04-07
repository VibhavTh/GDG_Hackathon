import Link from "next/link";
import { Icon } from "@/components/ui/icon";
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

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Back link */}
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

      {error && (
        <div className="mb-8 bg-error-container text-on-error-container rounded-lg px-4 py-3 text-sm font-body flex items-start gap-3">
          <Icon name="error" size="sm" className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form action={action} className="space-y-8">
        {isEdit && (
          <input type="hidden" name="product_id" value={product.id} />
        )}

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
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
            placeholder="What makes this product special? Growing method, flavor notes, suggested use..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Category + Price row */}
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
              className={`${inputClass} cursor-pointer`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="price" className={labelClass}>
              Price (USD) <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-0 top-3 text-on-surface-variant font-body">
                $
              </span>
              <input
                id="price"
                name="price"
                type="number"
                required
                min="0"
                step="0.01"
                defaultValue={
                  product ? (product.price / 100).toFixed(2) : ""
                }
                placeholder="0.00"
                className={`${inputClass} pl-4`}
              />
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className="space-y-1.5">
          <label htmlFor="stock" className={labelClass}>
            Initial Stock
          </label>
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
          <p className="text-xs text-on-surface-variant/60 font-body">
            You can adjust stock any time from the inventory page.
          </p>
        </div>

        {/* Image URL */}
        <div className="space-y-1.5">
          <label htmlFor="image_url" className={labelClass}>
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            type="url"
            defaultValue={product?.image_url ?? ""}
            placeholder="https://..."
            className={inputClass}
          />
          <p className="text-xs text-on-surface-variant/60 font-body">
            Paste a direct image link. Drag-and-drop upload coming soon.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-primary text-on-primary font-label font-bold py-4 rounded-xl hover:bg-primary/90 active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm"
          >
            {isEdit ? "Save Changes" : "Add to Inventory"}
          </button>
          <Link
            href="/inventory"
            className="px-8 py-4 bg-surface-container-highest text-on-surface font-label font-bold rounded-xl hover:bg-surface-variant active:scale-95 transition-all duration-200 uppercase tracking-widest text-sm text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
