# Setup

## Requirements

- Node.js compatible with Next 15 and React 19.
- PostgreSQL database connection in `.env`.
- PayPal sandbox keys if testing PayPal checkout.
- Stripe test keys if testing credit-card checkout.
- Resend keys if testing order receipt emails.

## Install

```bash
npm install
```

`postinstall` runs Prisma generate automatically.

## Run Locally

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Quality Checks

```bash
npm run lint
npx tsc --noEmit
npm test -- --runInBand
npm run build
```

Use `npm run start` after `npm run build` if you want to run the production build locally.

## App Areas

- Storefront: `app/(root)`
- Auth: `app/(auth)`
- Admin: `app/(root)/admin`
- API auth route: `app/api/auth/[...nextauth]/route.ts`

## Environment Variables

Use `.env.example` as the safe template:

```bash
cp .env.example .env
```

Then fill in the values for your local database and provider accounts.

Required and optional variables used by the app:

```env
DATABASE_URL=

AUTH_SECRET=
NEXTAUTH_SECRET=

NEXT_PUBLIC_APP_NAME=Pokemon Store
NEXT_PUBLIC_APP_DESCRIPTION=A store for Pokemon products
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

PAYPAL_CLIENT_ID=
PAYPAL_APP_SECRET=
PAYPAL_API_URL=https://api-m.sandbox.paypal.com

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

UPLOADTHING_TOKEN=
UPLOADTHING_SECRET=
UPLOADTHING_APPID=

RESEND_API_KEY=
SENDER_EMAIL=

PAYMENT_METHODS=
DEFAULT_PAYMENT_METHOD=
ORDER_REPORT_TIME_ZONE=America/Toronto
UNPAID_ORDER_EXPIRE_MINUTES=60
```

Provider-specific details are documented in `docs/paypal.md`, `docs/stripe.md`, `docs/uploadthing.md`, and `docs/email.md`.
