# TozYcozY Backend

Node.js + Express + MongoDB API for the TozYcozY storefront.

## Setup

```bash
npm install
cp .env.example .env
# edit .env — paste your MongoDB URI and set a JWT_SECRET
npm run seed       # populates MongoDB with the shirt + shoes products
npm run dev        # http://localhost:5000
```

## Folder structure

```
src/
  config/db.js          MongoDB connection
  models/                Mongoose schemas (User, Product, Order, Otp)
  controllers/            Route handler logic
  routes/                 Express routers
  middleware/              auth (JWT), rate limiting, error handling
  utils/                  jwt.js, otp.js
  seed/seedProducts.js    Populates the DB with starter products
  app.js                  Express app + middleware wiring
  server.js               Entry point
```

## API Reference

### Auth — Email/Password
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | |
| POST | `/api/auth/login` | `{ email, password }` | |

### Auth — Mobile/OTP
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/otp/request` | `{ phone }` | 10-digit Indian mobile, no +91 prefix. OTP printed to console in dev. |
| POST | `/api/auth/otp/verify` | `{ phone, code, name? }` | `name` only used if this is a brand-new user |

### Session
| Method | Route | Notes |
|---|---|---|
| GET | `/api/auth/me` | requires auth cookie |
| POST | `/api/auth/logout` | clears the cookie |

### Products
| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/api/products` | public | `?search=`, `?category=`, `?featured=true` |
| GET | `/api/products/:slug` | public | |
| POST | `/api/products` | admin | create new product |
| PUT | `/api/products/:slug` | admin | update product |
| DELETE | `/api/products/:slug` | admin | soft delete (sets isActive:false) |

### Orders
| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/orders` | user | `{ items: [{productId(slug), size, quantity}], address, paymentMethod }` |
| GET | `/api/orders/my` | user | current user's order history |
| GET | `/api/orders/:orderId` | user | single order, must belong to requester |

## Switching OTP to real SMS

Right now OTPs print to your terminal — perfect for development, costs nothing.
When you're ready to send real texts, open `src/utils/otp.js` and uncomment one
of the provider examples (Twilio or MSG91), add your API credentials to `.env`,
and you're live — no other code changes needed.

## Making a user an admin

Products can only be created/edited/deleted via routes protected by `adminOnly`
middleware. To promote a user:

```js
// via mongosh, MongoDB Compass, or Atlas web UI:
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Security notes

- Passwords are hashed with bcrypt (10 rounds), never stored or returned in plaintext
- JWT is stored in an httpOnly cookie — not accessible to JavaScript, mitigates XSS token theft
- Rate limiting on auth + OTP endpoints prevents brute-force and SMS-bombing abuse
- Order totals are always recalculated server-side from the DB — client-sent prices are never trusted
