# ZEITLESS Product Detail Design

## Goal

Build the product detail page as an editorial storefront slice that matches the enhanced gallery reference while staying Astro-first.

The page should feel more like a curated lookbook than a standard ecommerce PDP:

- Desktop uses a masonry collage for the product imagery.
- The right-hand detail column stays fixed while the user scrolls the gallery.
- Mobile uses a carousel for the images because a vertical collage is too dense on small screens.

## Scope

This spec covers the first implementation of the product detail page only.

Included:

- Breadcrumb and page header
- Desktop collage gallery
- Sticky product detail panel
- Related items section
- Mobile carousel for product images
- Mock data for all content

Excluded:

- Real API wiring
- Cart interaction
- Checkout interaction
- Reservation mutations
- Buyer authentication

## Reference Shape

The implementation should follow the enhanced gallery reference in:

- `stitch/zeitless_product_detail_enhanced_gallery/code.html`
- `stitch/zeitless_product_detail_enhanced_gallery/screen.png`

The important visual constraints are:

- Left side is image-forward and editorial.
- Right side is a fixed detail panel on desktop.
- Image presentation should feel asymmetric, layered, and slightly curated rather than grid-flat.

## Layout

### Desktop

- Use a two-column layout.
- Left column:
  - Masonry-style collage of 4 product images.
  - Uneven sizing and offsets for visual rhythm.
  - Captions beneath each image, using small uppercase labels.
- Right column:
  - Sticky detail panel that starts near the top of the viewport.
  - Product title, price, note, provenance, condition, materials, CTA buttons, and authentication note.
- Below:
  - Related items section with 3 cards.

### Mobile

- Replace the collage with a shadcn carousel.
- Keep the detail content stacked below the gallery.
- Keep the related items section below the main content.
- Do not use the desktop collage pattern on mobile.

## Component Breakdown

The page should be split into small Astro components:

- `site-header`
- `product-breadcrumb`
- `product-gallery-desktop`
- `product-gallery-mobile`
- `product-detail-panel`
- `product-related-items`
- `site-footer`

If the mobile carousel needs interaction primitives, install the shadcn carousel and use it only for the mobile gallery.

## Data Model

Mock data should live in `apps/web/src/lib/data.ts`.

The data should include:

- Breadcrumb segments
- Product title, price, collection label, description, provenance, condition, materials, and CTA copy
- Gallery image array with captions
- Related product cards

No page file should contain hardcoded mock content beyond simple composition.

## Interaction Rules

- Desktop gallery: no carousel.
- Mobile gallery: carousel allowed and preferred.
- The sticky detail column should only activate at desktop breakpoints.
- CTA buttons can be decorative for this phase if the API flow is not wired yet.
- The page should remain Astro-first. Only use client-side JS where the carousel requires it.

## Styling Rules

- Reuse the existing storefront layout and theme tokens.
- Preserve the brand palette and typography established in the home and collection pages.
- Maintain the zero-radius, editorial look.
- Use masonry offsets and figure captions to make the gallery feel curated rather than mechanical.
- Use subtle CSS transitions first; do not introduce motion libraries unless the mobile carousel needs them indirectly through shadcn.

## Acceptance Criteria

- Desktop product detail page renders as a masonry collage on the left and a sticky detail panel on the right.
- Mobile product detail page uses a carousel for product images.
- All mock content is stored in `apps/web/src/lib/data.ts`.
- The page is split into reusable Astro components instead of one large template.
- The layout matches the enhanced gallery reference closely enough that the composition is immediately recognizable.

## Risks

- If the gallery collage is too rigid, the page will drift toward a generic ecommerce PDP.
- If the mobile carousel is too heavy, it may undermine the Astro-first goal.
- If the sticky panel grows too tall, it may become awkward on medium desktop heights and need a shorter content stack.

## Implementation Notes

- Prefer static Astro components for structure and data rendering.
- Use shadcn carousel only on mobile.
- Keep mock data separate from layout code.
- Keep the detail panel independent from the gallery so the same content can render in both desktop and mobile layouts.
