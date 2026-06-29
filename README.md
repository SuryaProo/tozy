<<<<<<< HEAD
# TozYcozY — Luxury Fashion Website

Premium React + TypeScript + GSAP fashion brand frontend.

## Quick Start

```bash
npm install
npm start        # dev server at http://localhost:3000
npm run build    # production build in /build
```

## Tech Stack
- React 18 + TypeScript
- GSAP + ScrollTrigger (scroll animations, letter animations)
- Framer Motion (page transitions, card animations)
- Inter font (Google Fonts)

## Project Structure
```
src/
  components/       # All UI components
    Cursor.tsx      # Custom red cursor
    Landing.tsx     # Intro screen with GSAP letter animation
    Navbar.tsx      # Sticky nav with scroll effect
    Hero.tsx        # Word-split scroll animation (TOZY ↔ COZY)
    ProductCard.tsx # Glass card with 3D tilt
    ProductDetail.tsx # Full product page with specs + exploded view
    ExplodedView.tsx  # Anatomy grid with hover tooltips
    Footer.tsx      # Newsletter + footer
  data/
    products.ts     # ← ALL product data lives here
  types/
    index.ts        # TypeScript interfaces
  styles/
    globals.css     # CSS variables + base reset
```

## How to Add Product Images
1. Drop images in `public/images/shirts/` or `public/images/shoes/`
2. In `src/data/products.ts`, update the `images` array:
   ```ts
   images: [
     '/images/shirts/front.jpg',
     '/images/shirts/back.jpg',
   ]
   ```
3. In `ProductDetail.tsx`, find the comment `=== IMAGE INTEGRATION POINT ===`
   and replace the emoji `<div>` with:
   ```tsx
   <img src={product.images?.[0]} alt={product.titleLine2}
        className="product-3d-image" />
   ```

## How to Add More Products
In `src/data/products.ts`, push a new object to `PRODUCTS[]`.
Each product needs: id, category, emoji, title, features[], sizes[], specs[], parts[].

## Backend Integration (Next Step)
- Replace `PRODUCTS` array with an API call: `fetch('/api/products')`
- Add cart state management (Zustand or Context API)
- Add order/checkout flow with Razorpay/Stripe
- Recommended backend: Node.js + Express + MongoDB or Next.js API routes

## Image Recommendations
For each product, you need:
- 1 hero image (1:1 ratio, white/light background, 1200×1200px)
- 2-3 detail images
- Tools: Canva, Adobe Firefly, Midjourney, or hire a product photographer
- Free option: unsplash.com (search "linen shirt flat lay" or "minimal sneaker")

## Color System (CSS Variables)
```
--red:   #C41E3A  (brand red)
--black: #0A0A0A  (headings)
--white: #FFFFFF  (background)
```
=======
# tozy
>>>>>>> 21d6182627431127fdbd1df7adff0504ac8d0154
