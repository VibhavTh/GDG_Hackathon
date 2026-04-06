"use client";

import { useState } from "react";
import Image from "next/image";
import { Chip } from "@/components/ui/chip";
import { AddToCartButton } from "@/components/ui/add-to-cart-button";

const categories = [
  "All Produce",
  "Vegetables",
  "Dairy & Eggs",
  "Honey & Preserves",
  "Wildflowers",
];

const products = [
  {
    id: "1",
    name: "Wildflower Honey",
    price: 18.0,
    description:
      "Pure, unpasteurized honey harvested from our meadow hives. Notes of clover and thyme.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAqq1m2tksG_zoaa09ZBoRrRxJZEExWsxyw4Xh8Rkkm-ZPaXgMulU1VhLktMnvh4wHcoxkwO_UsrkIx0Nrv73U8IQJtjXZ0L6Sd1X2hUMcDzdL_IkMlnyhxDMFXCe1NPtTY7UPIWMyqXh8HcTevmNTudIfAyWxwk8P6W1QHeDVUc-7Tx9UxuPyPsnF0iCxKihRr1_ZMuQKsa8Us61o5YyrMS44L5iV0S1SS5EbyBrpn53JhF55GhCXt2k1e2G94438XcXELFnWBNBnD",
    badge: "In Season",
    category: "Honey & Preserves",
  },
  {
    id: "2",
    name: "Heirloom Variety",
    price: 9.5,
    description:
      "Mix of Cherokee Purple, Brandywine, and Green Zebra. Sun-ripened and bursting with flavor.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBBTJRm6ABoX4U5hm0NVNPBWdI_fgpFliyg1UkZbq_ESj8xv-kgPinVp3cYZiabpbn6n3qpnYvLzcROyRnEcE8EOtK04qd9y0Kc1oAya0UYkMdjjTxREM-Rga7NsZ2YVzLG4CXnVdNwubOVN9gQoZJwo3ubjBUguEM5gLbd-Czlmf-8nIlKxsWc-BPoALShTfqPD5Ccev5U6XJifv2hHqDVCtI07RYJEbgfChSE8EVYht2DB8deqImyBYV3Ezgjm50TR1dOwEEwppUu",
    badge: "Limited",
    category: "Vegetables",
  },
  {
    id: "3",
    name: "Meadow Eggs",
    price: 12.0,
    description:
      "One dozen eggs from our heritage hens. Deep orange yolks and exceptional richness.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBCy6hlqM-LzEIkheEPyNHv1MqFg5hnxjfZS7VXMCwO1XylgILhrl-1pSb9WR7D8_Yw2jzP5k4Gw4bK77zWi1PFEmz_4tq1hj0Hgsco3bDyKlKX1n52-X1yBvJS_MN9FjypZQwKK_2aLtsd3KKkiXFWYYnU3txIdeMS199QL55Tpgj6Eg-bGuojOwDWRxPWAgEBs0A-QQ-TSRg0Oqmeo7LnkrjWoLwhcqWsoKlrZ3diURWOMJiB26ldj3G7_yZfC9M9jLRLy4NWqQFE",
    badge: "Daily Fresh",
    category: "Dairy & Eggs",
  },
  {
    id: "4",
    name: "Morning Greens",
    price: 6.0,
    description:
      "Bespoke mix of kale, chard, and spinach. Harvested at dawn for peak crispness.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDvEP-ruzyyClkTF7-SzVPQd8qDJ1brVeu5Gi2nO9-39r2Gxm4PzNCM3wXZdZSUdbnBgtImjRN7LrQIGRKnVyWWxGzVaiIrhjeOooQp96Ltp6ipdbngNA3szfvGaRD9_8Cx6LzQM7zkvU8y0AfWrfhY6czeIQ5Tqd7fX40VFwGn0ByJKlULu_NGDiYoMF21tyP1JboqyTTSeQ4bayl6hymMhOSGaj3oUJNmdfkhYBoIMwI5DRz-Yt7TVgPVr_1vzsbPRvXKMl-UUFzy",
    badge: "In Season",
    category: "Vegetables",
  },
  {
    id: "5",
    name: "Herbed Chèvre",
    price: 14.0,
    description:
      "Creamy goat cheese infused with garden-fresh rosemary and pink peppercorn.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDP2_YdHlyTX-yy7_EnPuzWHbp_THBK8cCVi_-E61ukp12JOh8uQpEmxAKM_jQuzrPZP4kJlzd1S37XUIVrVcvN55VdZTO4nTjAEeFLCn_r2TRmnmtyXcky5IOV7DAL0nylfbVhzfvz4W4WY50po5Lc0vZ5dVBRqpskDhxBRREW8qRbkWpdadJ9hnVZwEFjQI0psNtwpDuc2qAkVZmLMwAMgSBqXU881gEJs9TBq3LVmuB-9Dfx1W5tQWtjYgomyn47PY-uOW5q9qB_",
    badge: "Small Batch",
    category: "Dairy & Eggs",
  },
  {
    id: "6",
    name: "Earth Roots",
    price: 7.5,
    description:
      "Duo of heirloom carrots and garden radishes. Sweet, peppery, and earthy.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuArjVFYggUnmXQX10MMLfYq3rBBSoQVyLC32t-uQqZpDxH02iDv_0-Nh4aa4Adu5dTSpEPfYRfxP3adG4Q05SA1eTeYZX-hwURwnMY491bpF8YkBVKuNmBGhhZ4SpMWvtJV2EKVg5_4Q5ZKz5zIAJ90yxOcsMdedu4ZF-yggML4TlFzxDCjohcAKsWHNH9XwkjjVe1KhyfylJgOf_Mrw_NAjI8q7ATo4TkbhFWttqQNlOrINlPORWF-U6AAz7op6xBqznlbuvoeZ_Kj",
    badge: "In Season",
    category: "Vegetables",
  },
];

export default function ProductCatalogPage() {
  const [activeCategory, setActiveCategory] = useState("All Produce");

  const filtered =
    activeCategory === "All Produce"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Header */}
      <header className="pt-12 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-headline text-tertiary mb-6 tracking-tight">
            The Season&rsquo;s Bounty
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-on-surface-variant font-body">
            Hand-picked, organically grown, and delivered from our soil to your
            table. Experience the tactile beauty of slow-grown produce.
          </p>
        </div>
      </header>

      {/* Main Catalog */}
      <main className="max-w-7xl mx-auto px-6 pb-24">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
            />
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className={`harvest-card group bg-surface-container-low p-6 rounded-xl flex flex-col transition-all duration-500 ${
                i >= 3 ? "mt-8" : ""
              }`}
            >
              <div className="relative -mt-12 mb-6 h-64 overflow-hidden rounded-lg">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2"
                />
                <span className="absolute top-4 right-4 bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                  {product.badge}
                </span>
              </div>

              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-headline text-tertiary">
                  {product.name}
                </h3>
                <span className="text-xl font-headline text-primary">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">
                {product.description}
              </p>

              <div className="mt-auto">
                <AddToCartButton
                  item={{
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    unit: "each",
                  }}
                /></div>
            </div>
          ))}
        </div>
      </main>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-6 mb-24 content-lazy">
        <div className="bg-surface-container rounded-2xl p-12 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-4">
            <h2 className="text-4xl font-headline text-tertiary tracking-tight">
              Join the Harvest Circle
            </h2>
            <p className="text-on-surface-variant">
              Receive weekly updates on what&rsquo;s blooming and blooming soon.
              Exclusive first access to our small-batch releases.
            </p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input
              className="bg-surface-container-highest border-0 border-b-2 border-outline-variant focus:ring-0 focus:border-primary px-4 py-3 min-w-[300px] text-sm font-body"
              placeholder="Your farm-friendly email"
              type="email"
            />
            <button className="bg-primary text-on-primary px-8 py-3 rounded-md font-medium text-sm transition-transform active:scale-95">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
