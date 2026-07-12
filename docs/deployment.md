# Deployment

## Vercel Notes

Set production environment variables in Vercel before deploying:

```env
DATABASE_URL=
AUTH_SECRET=
NEXTAUTH_SECRET=
NEXT_PUBLIC_SERVER_URL=
PAYPAL_CLIENT_ID=
PAYPAL_APP_SECRET=
PAYPAL_API_URL=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
SENDER_EMAIL=
```

`NEXT_PUBLIC_SERVER_URL` should match the deployed app URL.

## Prisma

`package.json` includes:

```json
"postinstall": "prisma generate"
```

This ensures the generated Prisma client exists during deployment.

If the Prisma schema changes, apply the migration to the production database before relying on the new field in deployed code.

## Timezones

Server-rendered dates may depend on the server runtime timezone. For user-local display, use:

```txt
components/shared/local-date-time.tsx
```

That component formats dates in the browser timezone, so it works correctly on Vercel.

## Common Checks

Before deployment, run:

```bash
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```
