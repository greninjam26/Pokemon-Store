# Deployment

## Vercel Notes

Set production environment variables in Vercel before deploying. Use `.env.example` as the checklist, then replace local and sandbox values with production values where needed.

`NEXT_PUBLIC_SERVER_URL` should match the deployed app URL.

Use sandbox payment keys in preview deployments. Use live PayPal and Stripe keys only when the store is ready to accept real payments.

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

## Pre-Deploy Checks

Before deployment, run:

```bash
npm run lint
npx tsc --noEmit
npm test -- --runInBand
npm run build
```
