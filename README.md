# ACME Retail

Everyday-goods storefront and back office. The shop, checkout, and `/api` routes are one Next.js app. Shipping, tax, and the default payment step are illustrative. No real money moves unless you optionally connect a Stripe test key.

## Run locally

1. Install dependencies with `pnpm install`, then generate product art with `pnpm art`.
2. Copy `.env.example` to `.env.local` and fill in the Supabase URL, anon key, and service role key. Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000`.
3. In the Supabase SQL editor, run `supabase/migrations/001_schema.sql` once. For local signup, disable email confirmation under Authentication, or confirm each new user manually. Add `http://localhost:3000/auth/callback` to the redirect allow list.
4. Seed forty products, inventory, and sixty orders with `pnpm seed`.
5. Start the app with `pnpm dev` and open http://localhost:3000.

Search, filters, cart, checkout, orders, tracking, returns, and the office pages talk to `/api` and stay saved in Supabase after a reload.

## Demo accounts

Password for every seeded account: `DemoPass123!`

- Customer: customer@acme-retail.example
- Catalog: catalog@acme-retail.example
- Warehouse: warehouse@acme-retail.example
- Finance: finance@acme-retail.example
- Administrator: admin@acme-retail.example

A second customer, Jordan Lee, exists only in the seed at jordan@acme-retail.example and uses the same password. Navigation changes with the role. Customers see orders and returns. Staff see the matching back-office pages.

## Checkout

Coupons: WELCOME10 (10%), SAVE15 ($15 off subtotals of $80 or more), FREESHIP (standard shipping). Standard shipping is $8.95, express is $18.95, and standard is free when the discounted subtotal is $75 or more. Tax is an illustrative 8.25% and is not a filed tax calculation.

Checkout reserves stock for 20 minutes and saves the unit price on the order. Simulated outcomes are approved, declined, authentication required, and timeout. Decline, timeout, and cancel release the reservation. Shipping decrements on-hand and reserved together. Payment status and delivery status are separate.

The administrator simulation lab can switch scenarios, advance the clock, inspect events, and reset data. Reset asks you to type RESET and needs the service role key.

## Optional Stripe test mode

Set STRIPE_SECRET_KEY to a key that starts with sk_test_. Live keys are refused. Point the webhook at `/api/payments/stripe/webhook`. A return to the payment result page also confirms the session by retrieving it, so a local demo works without the webhook. This path still does not move real money.

## Deploy on Vercel

The website and the API are the same deployment. There is no second service.

1. Import the repository in Vercel.
2. Set the same environment variables as `.env.local`, with `NEXT_PUBLIC_SITE_URL` set to the production URL.
3. Add that URL plus `/auth/callback` to the Supabase redirect allow list.
4. Deploy. `pnpm build` is the build command.
5. Run `pnpm seed` once against the production environment, with the service role key available in that shell. Do not expose the service role key to the browser.

Storage buckets `product-media` and `avatars` are created by the SQL migration. Product art is also served from `public/products` if storage is empty. Realtime is enabled for orders, shipments, shipment events, inventory, and domain events.

## Checks

`pnpm check` verifies coupon math, tax rounding, the 40-product catalog, the 60-order demo set, and stock that never goes negative. It does not call a live database. Apply the SQL and run `pnpm seed` before exercising login and checkout in the browser.
