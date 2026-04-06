"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { Chip } from "@/components/ui/chip";

const inventoryCategories = [
  "All Products",
  "Root Vegetables",
  "Artisan Dairy",
  "Orchard Fruit",
];

const products = [
  {
    id: "1",
    name: "Rainbow Carrots",
    category: "Root Vegetables",
    taxCategory: "Fresh Produce (0%)",
    price: 4.5,
    unit: "bunch",
    stock: 42,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpjiq1k0_y9oQj2aVu0pl8wXSuEChc8HV1yDZvDSR2vvAKmKcraAYNcFZx3ioaMDHYGDMJRHQ4Nflpq4_2iWTiSV7euyn1bFhdVvT3pCbSGoyu6-DeNYydFx2JCKvIlXZ6c6_2G7_DBHEQopFxTtvs7JMlR9FXljuA7dEHmubmfkDvVKaNcDZCUgF_cXlnltKeoBmLrTVE8C-0i4UPWjB9c_chbxmCyr6FaYWAQFjj8fP0sKJM4RHhazmE6ZE8FolGy0Lz5OWJojzk",
    lowStock: false,
  },
  {
    id: "2",
    name: "A2 Raw Milk",
    category: "Artisan Dairy",
    taxCategory: "Dairy (Exempt)",
    price: 8.0,
    unit: "quart",
    stock: 18,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC03i7KMqMfjnfyPvkSEjDtjyBi2v40WzEqhq-WwHPVQ3SNhrigyyjVNMpY9ibEhICYT18UOVeCaWl6ZqeweO-y6mX8xM90_Dbex2oSU8e-njE4tyPRr2ry7P6rXaraVTq6CB0YrRuR6-ke4zdO8DIeMEwlx8AaGCdAV3CH-jjQUIkC_MctKi3RPqUIeAh4zkhgr-7xvhpVXQLWu2UqbFD71U3WM-J0u-MzNR6dsg-g8cGaPf2aUqeZJIKrOrvrOATE4ls3RuJCIiJI",
    lowStock: false,
  },
  {
    id: "3",
    name: "Wildflower Honey",
    category: "Pantry",
    taxCategory: "Value-Add (5.5%)",
    price: 12.5,
    unit: "8oz jar",
    stock: 3,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDUZPqVAqqq0eBXmyN5RPhdsU3Gg_hGh4QBtYZ4gjhDTo8-E8mUTxlJcv6dm-3PH1zDFvmR2O47wVEjuo0da0hCeyeE5UlXgCJfDgVWjKbVGO7mQMVw07vV7PF7WBD3E0GuamIWfmAdiFWcqvjL-CxzVteWH5X2f5zJzB9J5GfcTlhK7fepJPE7YEuygurWnGvuytMBGG6pBKIzBqLSLk5Np54LbmSvYEW6hWf8aSiVV7MA2JMEqsmQBWnhek_zLUUSawcPZus_scBg",
    lowStock: true,
  },
];

const removedItems = [
  {
    name: "French Breakfast Radishes",
    deletedDate: "Oct 24, 2024",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAU3SBH4T9wqzQ1D8LSn3wQ3nwacgYhx_6FDurvIATTW-gkoZRkFxAdguW0L7onhj9I1-qTnboNsPmwbUfi6OxuPiNg7XrjUTKYbHNcf0rrewcHAqSYv7VJwNYcnYEbBkerTPyrNv8dh5LP0QPKJTPkfbVuXDXxR0N1OLLR2lIMZaSPvKmbUBN6iTQsyvh1awWpm0Rk6JCLok4mE7H9_iXFPMnVW25RWj7o87xvK8Ca4yeecAHqTXpV21j_c_oUEBrMXcZ05yCvcNI3",
  },
  {
    name: "Sugar Snap Peas",
    deletedDate: "Oct 20, 2024",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfWZc0UTptF1H8JGWhnUZ62L_KyqF_H41vvFFbv46Lg-81Tx4MTfj8t6B0-t7wadcG7-U7mIksTDNMlr4kqolbSEgEdek5XaTzxcFd_myZGmsa6cXUx3n7V1kKbQTRZvjngm2tW2dGZg94lMgrde0JN6KmfgIGXuhRz80RAK_vo1kYsYBhpoLX5lfgfCuN__A9nrA8sDGW3BQxoPKmJ_-oZCUx85oJ4IIX7gapD01NK_LHjm-wuiRzmBi9umbYNxIJtlb8N9hz_7-r",
  },
];

export default function InventoryPage() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [stocks, setStocks] = useState<Record<string, number>>(
    Object.fromEntries(products.map((p) => [p.id, p.stock]))
  );

  const updateStock = (id: string, delta: number) => {
    setStocks((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  return (
    <>
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <h2 className="text-2xl font-headline font-semibold tracking-tight italic text-tertiary">
            Inventory Management
          </h2>
          <div className="flex items-center gap-4">
            <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium active:scale-95 transition-transform flex items-center gap-2">
              <Icon name="add" size="sm" />
              Add New Product
            </button>
            <div className="hidden md:flex items-center gap-2">
              <Icon name="search" className="text-on-surface-variant" />
              <input
                className="bg-surface-container-highest/50 border-none focus:ring-0 text-sm rounded-md w-48 placeholder:text-on-surface-variant/50"
                placeholder="Search inventory..."
                type="text"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Filters */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h3 className="text-3xl font-headline text-tertiary">
              Current Stock
            </h3>
            <p className="text-on-surface-variant text-sm mt-1 font-medium">
              Manage 12 active listings across 4 categories.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {inventoryCategories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-surface-container-low rounded-xl p-6 transition-all hover:bg-surface-container-high group relative ${
                product.lowStock ? "opacity-60 grayscale-[0.4]" : ""
              }`}
            >
              {product.lowStock && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="bg-secondary text-on-secondary px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">
                    Low Stock
                  </span>
                </div>
              )}

              <div className="absolute top-4 right-4 flex gap-1">
                <button className="p-2 text-on-surface-variant hover:text-secondary transition-colors">
                  <Icon name="edit" />
                </button>
                <button className="p-2 text-on-surface-variant hover:text-error transition-colors">
                  <Icon name="delete" />
                </button>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-variant">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase tracking-tighter text-secondary font-bold mb-1">
                    {product.category}
                  </span>
                  <h4 className="text-lg font-headline font-bold text-tertiary">
                    {product.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Tax Category: {product.taxCategory}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-surface-container-lowest p-4 rounded-lg">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">
                    Price
                  </p>
                  <p className="text-lg font-headline text-primary">
                    ${product.price.toFixed(2)}{" "}
                    <span className="text-xs font-body italic text-on-surface-variant">
                      / {product.unit}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">
                    Stock
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateStock(product.id, -1)}
                      className="w-6 h-6 rounded-full bg-surface-container-highest text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all"
                    >
                      -
                    </button>
                    <span
                      className={`font-bold text-sm ${
                        (stocks[product.id] || 0) <= 5 ? "text-error" : ""
                      }`}
                    >
                      {stocks[product.id]}
                    </span>
                    <button
                      onClick={() => updateStock(product.id, 1)}
                      className="w-6 h-6 rounded-full bg-surface-container-highest text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Item Card */}
          <div className="bg-surface-container rounded-xl border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 text-center hover:border-primary transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:bg-primary-container transition-colors">
              <Icon name="add" className="text-primary group-hover:text-on-primary" />
            </div>
            <p className="font-headline text-lg font-bold text-tertiary">
              Add New Item
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              Expand your seasonal offerings
            </p>
          </div>
        </div>

        {/* Recently Removed Items */}
        <div className="mt-16 bg-surface-container-low rounded-2xl overflow-hidden">
          <div className="p-6 flex justify-between items-center bg-surface-container-low">
            <h4 className="font-headline text-xl text-tertiary">
              Recently Removed Items
            </h4>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Soft Deletes (30 days remaining)
            </p>
          </div>

          <div className="space-y-0">
            {removedItems.map((item, i) => (
              <div
                key={item.name}
                className={`p-4 flex items-center justify-between hover:bg-surface-container-highest/30 transition-colors ${
                  i % 2 === 1 ? "bg-surface-container/30" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-surface-variant grayscale opacity-50 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={40}
                      height={40}
                      sizes="40px"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-tertiary">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      Deleted: {item.deletedDate}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-1.5 rounded-full bg-surface-container-highest text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant text-on-surface transition-all">
                  Restore Listing
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
