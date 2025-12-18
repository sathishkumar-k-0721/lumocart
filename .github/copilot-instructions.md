# Lumocart - Next.js E-commerce Platform

## Architecture Overview

This is a **Next.js 14 App Router** e-commerce platform with dual-interface architecture:
- **User-facing storefront** (`/products`, `/cart`, `/checkout`, `/orders`)
- **Admin dashboard** (`/admin/*`) - separate layout without header/footer
- **MongoDB** via Prisma ORM with embedded JSON patterns for cart/order items
- **NextAuth.js** credential-based authentication with role-based access (USER/ADMIN)
- **Razorpay** payment gateway integration

## Critical Patterns

### Authentication & Authorization

- Use `requireAuth()` and `requireAdmin()` helpers from `lib/auth.ts` in API routes, not inline session checks
- NextAuth session includes: `id`, `email`, `name`, `role` (extends default session via JWT callbacks)
- Middleware (`middleware.ts`) enforces route-level authorization: admins → `/admin`, users → blocked from `/admin`
- Admin API routes must call `requireAdmin()` at the start; user routes use `requireAuth()`

### Data Model - MongoDB with Prisma

Cart and Order items are **stored as JSON arrays** (not separate collections):
```typescript
// Cart items structure
items: Json[] // [{ productId, quantity, price }]

// Order items structure  
items: Json[] // [{ productId, quantity, price, product: {...} }]
```

When fetching carts/orders, **manually join product data**:
```typescript
const items = cart.items as any[];
const products = await prisma.product.findMany({ 
  where: { id: { in: items.map(i => i.productId) } }
});
const itemsWithProducts = items.map(item => ({
  ...item,
  product: products.find(p => p.id === item.productId)
}));
```

### API Route Conventions

- Admin routes: `/api/admin/*` - require admin auth, return `{ ...item, _id: item.id }` for legacy compatibility
- User routes: `/api/*` - require user auth (orders/cart)
- Public routes: `/api/products`, `/api/categories` - no auth
- Error responses: Catch auth errors and return 401 with `{ error: message }`
- Use `revalidate = 60` export for caching on public routes

### Payment Flow (Razorpay)

1. Create order → generates `razorpayOrderId` (see `app/api/orders/route.ts`)
2. Frontend Razorpay checkout returns: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
3. Verify payment → `app/api/orders/verify-payment/route.ts` validates signature using HMAC SHA256
4. On success: Update order status to `PAID`/`PROCESSING`, clear user cart

### UI & Layout Architecture

- `ConditionalLayout` component wraps app - shows Header/Footer only for non-admin routes
- Toast notifications via `react-hot-toast` (see `components/ui/toast-provider.tsx`)
- Admin pages use separate layout (`app/admin/layout.tsx`)
- Client components for interactivity: cart, products list, login forms

## Environment Variables

Required in `.env`:
```
DATABASE_URL=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

## Development Workflow

```bash
npm run dev              # Start dev server (port 3000)
npx prisma generate      # Regenerate client after schema changes (auto on postinstall)
npx prisma db push       # Push schema to MongoDB
npx prisma studio        # GUI for database
```

**Important**: `reactStrictMode: false` in `next.config.mjs` to prevent double API calls during development.

## Common Pitfalls

- **Don't create separate collections** for cart/order items - use embedded JSON
- **Always validate Razorpay signature** server-side before updating payment status
- **Check user role in middleware** for route protection, not just in components
- **Use absolute imports** with `@/` prefix (configured in `tsconfig.json`)
- When adding products to cart, store `price` at time of addition (not just productId)
