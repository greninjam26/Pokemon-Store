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

## Useful Commands

```bash
npm run dev
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

The local dev server is usually started by the project owner. Agents should not start it unless asked.

## App Areas

- Storefront: `app/(root)`
- Auth: `app/(auth)`
- Admin: `app/(root)/admin`
- API auth route: `app/api/auth/[...nextauth]/route.ts`

## Environment Variables

Common variables used by the app:

```env
DATABASE_URL=
AUTH_SECRET=
NEXTAUTH_SECRET=
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_DESCRIPTION=
NEXT_PUBLIC_SERVER_URL=
PAYPAL_CLIENT_ID=
PAYPAL_APP_SECRET=
PAYPAL_API_URL=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENDER_EMAIL=
PAYMENT_METHODS=
DEFAULT_PAYMENT_METHOD=
```
