# Pokemon Store

A full-stack Pokemon TCG store built with Next.js, Prisma, PostgreSQL, NextAuth, Stripe, PayPal, UploadThing, Resend, shadcn/ui, and Tailwind CSS.

## Features

- Storefront with carousel, product search, filtering, sorting, and pagination
- Product detail pages with image gallery, cart controls, and verified-purchase reviews
- Guest and signed-in cart support with cart merging after sign in
- Checkout flow with shipping, payment selection, place order, and order details
- Stripe, PayPal, and cash-on-delivery payments
- Order expiration for unpaid online orders with stock restoration
- Resend order receipt emails
- Customer profile and order history
- Admin dashboard, reports, products, orders, users, and image uploads

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Prisma 7 with PostgreSQL
- NextAuth 5 beta
- Tailwind CSS 4
- shadcn/ui and Radix UI
- Stripe, PayPal, UploadThing, and Resend
- Jest and Testing Library

## Quick Start

Create `.env` from `.env.example`, then install dependencies and start the app:

```bash
cp .env.example .env
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

For the full setup, environment variables, database commands, and verification checklist, see `docs/setup.md`.

## Project Structure

```txt
app/                    Next.js routes
components/             Shared, admin, product, and UI components
db/                     Prisma client wrapper and seed data
docs/                   Detailed setup and provider notes
lib/action/             Server actions
prisma/                 Prisma schema and migrations
types/                  Shared app types
```

## Documentation

- `docs/setup.md` - local setup, commands, and environment variables
- `docs/database.md` - Prisma, migrations, and seed data
- `docs/deployment.md` - Vercel and production deployment notes
- `docs/paypal.md` - PayPal sandbox checkout
- `docs/stripe.md` - Stripe card payments and webhooks
- `docs/uploadthing.md` - product image uploads
- `docs/email.md` - Resend receipt emails
- `docs/roadmap.md` - current status and possible future work
