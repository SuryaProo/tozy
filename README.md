# TozYcozY — Full Stack

```
tozycozy-fullstack/
  frontend/    ← React + TypeScript site
  backend/     ← Node.js + Express + MongoDB API
```

## 1. Set up the backend first

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and paste your MongoDB connection string into `MONGODB_URI`:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tozycozy?retryWrites=true&w=majority
```

Get this from **MongoDB Atlas → your cluster → Connect → Drivers**. (If you don't have an Atlas
cluster yet, create a free one at https://www.mongodb.com/cloud/atlas/register — takes 2 minutes,
no credit card needed for the free tier.)

Also set a real `JWT_SECRET` — generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Then install and run:
```bash
npm install
npm run seed     # pushes your shirt + shoes products into MongoDB
npm run dev       # starts the API on http://localhost:5000
```

Visit `http://localhost:5000/api/health` — you should see `{"success":true,...}`.

## 2. Set up the frontend

In a new terminal:
```bash
cd frontend
npm install
npm start         # starts the site on http://localhost:3000
```

The frontend automatically calls the backend at `http://localhost:5000/api`
(configured in `frontend/.env` → `REACT_APP_API_URL`). If the backend isn't
reachable, the site still works using local fallback data — you'll see a small
yellow banner at the top reminding you to connect MongoDB.

## 3. Try it out

- **Browse products** → pulled live from MongoDB once seeded
- **Sign up / log in** (email or mobile OTP) → top right of navbar
- **Mobile OTP login**: enter any number starting with 6-9, the OTP is printed
  to your **backend terminal** (and shown in the UI in dev mode) since no real
  SMS provider is wired up yet — see `backend/src/utils/otp.js` for how to plug
  in Twilio or MSG91 later
- **Add to cart → Checkout → Place Order** → saved to MongoDB, visible in **Order History**
- **Add new products** → currently via the API directly (see below) since there's
  no admin UI yet

## Adding products dynamically

This is the core of what you asked for — products are no longer hardcoded in the
frontend. To add a new product, send a POST request to the backend:

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_ADMIN_TOKEN" \
  -d '{
    "slug": "classic-tee",
    "category": "Apparel",
    "emoji": "👕",
    "title": "Classic",
    "titleLine2": "Cotton Tee",
    "price": 1499,
    "sku": "TZC-TEE-001",
    "features": ["100% Organic Cotton", "Pre-shrunk"],
    "sizes": [{"label":"M","available":true},{"label":"L","available":true}],
    "specs": [{"label":"Fabric","value":"100% Cotton","detail":"180 GSM"}],
    "parts": []
  }'
```

Note: `POST /api/products` requires an **admin** user. The seed script creates
products directly in the database (bypassing this check) — that's the easiest
way to bulk-add products for now. To promote a user to admin manually:

```js
// In MongoDB Compass or Atlas UI, find the user document and set:
{ role: "admin" }
```

A proper admin dashboard (drag-and-drop product creation, image upload, etc.)
is a natural next step once you're ready — just ask.

## Docker (run both together)

```bash
# from tozycozy-fullstack/
docker-compose up --build
```
- Frontend → http://localhost:3000
- Backend  → http://localhost:5000

Make sure `backend/.env` has your real `MONGODB_URI` before running this.

## Architecture recap

```
React (frontend) → fetch('/api/...') → Express (backend) → Mongoose → MongoDB Atlas
                         ↑ httpOnly cookie for auth (JWT)
```

- Auth: email/password OR mobile+OTP, both issue the same JWT session cookie
- Products: fully dynamic — add/edit/remove via API, frontend always reflects DB state
- Orders: placed orders are saved per-user, visible in Order History after login
- OTP: currently logs to the backend console (free, zero setup) — swap in
  Twilio/MSG91 in `backend/src/utils/otp.js` whenever you're ready to send real SMS
=======

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
>>>>>>> 698c4109fdb374affa8d5e6f93e71792fd7ca5f9
