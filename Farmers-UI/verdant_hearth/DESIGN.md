# Design System Strategy: The Digital Hearth

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Hearth."** 

We are moving away from the sterile, rigid grids of standard e-commerce to create a digital experience that feels as tactile and intentional as a hand-bound ledger or a curated farm-to-table menu. This system prioritizes warmth over efficiency and character over conventions. 

To achieve a "High-End Editorial" feel, we reject the "template" look by utilizing:
*   **Intentional Asymmetry:** Breaking the vertical flow with overlapping images and offset text containers.
*   **Tonal Depth:** Replacing harsh lines with a sophisticated hierarchy of cream and forest-green surfaces.
*   **Organic Tactility:** Integrating grain and paper textures to bridge the gap between the screen and the soil.

## 2. Colors: The Earthy Palette
This system is anchored in the harvest. We use `primary` (Forest Green) for authority and growth, `secondary` (Terracotta) for energy and clay-rich soil, and `surface` (Cream) to provide a soft, breathable canvas.

### The "No-Line" Rule
**Under no circumstances shall a 1px solid border be used to section off content.** We define boundaries through tonal shifts. A section should be distinguished by moving from `surface` (#fcf9f0) to `surface-container-low` (#f6f3ea) or `surface-container` (#f1eee5). This creates a seamless, high-end "wash" effect rather than a boxed-in feel.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **Base:** `background` (#fcf9f0)
*   **Secondary Content Blocks:** `surface-container-low` (#f6f3ea)
*   **Cards & Interactive Elements:** `surface-container-highest` (#e5e2da) or `surface-container-lowest` (#ffffff) to provide "pop" against the cream background.

### Signature Textures & Gradients
To avoid a flat "vector" look, apply a subtle noise or recycled paper texture overlay at 3% opacity globally. For CTAs, use a subtle linear gradient from `primary` (#173809) to `primary_container` (#2d4f1e) to provide a sense of depth and "soul" that solid hex codes lack.

## 3. Typography: Editorial Sophistication
We pair the literary, humanistic character of **Newsreader** with the functional clarity of **Plus Jakarta Sans**.

*   **Display & Headlines (Newsreader):** Used for storytelling. The `display-lg` and `headline-md` scales should feel like a premium lifestyle magazine. Use `tertiary` (#48290a) for headlines to maintain a soft, organic contrast rather than pure black.
*   **Body & Labels (Plus Jakarta Sans):** Used for utility. This sans-serif ensures that even at `body-sm`, farm data and product descriptions remain legible.
*   **The Signature Style:** Use `display-md` for large, atmospheric quotes or section headers, often paired with an asymmetrical layout to guide the eye through the "story" of the farm.

## 4. Elevation & Depth
Depth in this design system is achieved through **Tonal Layering** rather than traditional structural lines.

*   **The Layering Principle:** Instead of shadows, place a `surface-container-lowest` card on a `surface-container-low` section. This creates a natural "lift" mimicking stacked paper.
*   **Ambient Shadows:** If an element must float (e.g., a modal or a floating action button), use an extra-diffused shadow. Set the color to `on-surface` (#1c1c17) at 5% opacity with a 20px-40px blur. This mimics natural, ambient light in a cozy room.
*   **The "Ghost Border" Fallback:** If a container requires definition for accessibility, use the `outline-variant` token (#c3c8bb) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** For top navigation bars or floating overlays, use `surface` at 80% opacity with a `backdrop-blur` of 12px. This allows the organic textures of the background to bleed through, softening the interface.

## 5. Components

### Buttons
*   **Primary:** Background: Gradient `primary` to `primary_container`. Text: `on-primary` (#ffffff). Shape: `rounded-md` (0.75rem).
*   **Secondary:** Background: `surface-container-highest`. Text: `primary`. 
*   **Tertiary (Ghost):** Text: `secondary` (#a03f29). No background until hover.

### Cards
Cards must never have borders. Use `surface-container-low` and a corner radius of `rounded-lg` (1rem). For featured products, use `rounded-xl` to emphasize the "hand-crafted" feel. Use generous internal padding (at least 2rem) to allow the typography to breathe.

### Input Fields
*   **Style:** Minimalist. Background: `surface-container-highest`. 
*   **Bottom Border Only:** Instead of a full box, use a 2px bottom stroke in `outline-variant` that transitions to `primary` on focus.
*   **Labels:** Always use `label-md` in `on-surface-variant` above the field.

### Chips & Tags
Use `secondary_fixed` (#ffdad2) for backgrounds with `on_secondary_fixed` (#3d0700) for text. These should be `rounded-full` (9999px) to act as soft, organic markers against the more structured cards.

### Lists
**Strictly forbid divider lines.** Separate list items using `margin-bottom` from the spacing scale or subtle background toggles between `surface` and `surface-container-low`. This maintains the "Digital Hearth" editorial flow.

### Signature Component: The "Harvest Card"
A custom component for this system: an asymmetrical card where the image overflows the `surface-container` by 16px, using a `rounded-lg` clip. This breaks the grid and reinforces the bespoke, hand-crafted nature of the brand.

## 6. Do's and Don'ts

### Do:
*   **Do** use `secondary` (Terracotta) as a "spice" color—sparingly for accents, notifications, or callouts.
*   **Do** embrace white space. If you think there's enough room, add 16px more.
*   **Do** use "soft" alignment. It’s okay if an image doesn't perfectly align with a text block's baseline if it creates a more dynamic editorial feel.

### Don't:
*   **Don't** use pure black (#000000). Use `on-surface` (#1c1c17) to keep the palette warm.
*   **Don't** use `rounded-none`. Everything in nature has a radius; our UI should too.
*   **Don't** use standard "drop shadows." They feel like software; we want to feel like a farm. Use tonal layering first.
*   **Don't** use high-contrast dividers. They create "visual noise" that disrupts the cozy, calm atmosphere.