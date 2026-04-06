export const productCategories = [
  "All Produce",
  "Vegetables",
  "Dairy & Eggs",
  "Honey & Preserves",
  "Baked Goods",
  "Wildflowers",
  "Fruits",
  "Herbs",
  "Meat",
  "Pantry",
  "Seasonal Box",
] as const;

export type ProductCategory = (typeof productCategories)[number];
