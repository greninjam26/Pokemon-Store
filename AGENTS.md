<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pokemon Store Agent Notes

## Project Shape

- Next.js App Router project using Next 15.
- Main customer routes live under `app/(root)`.
- Admin routes live under `app/(root)/admin`.
- Auth routes live under `app/(auth)`.
- Server actions live in `lib/action`.
- Prisma client is generated to `lib/generated/prisma` and wrapped by `db/prisma.ts`.
- Shared validators live in `lib/validators`; exported types live in `types/index.ts`.

## Working Rules

- Do not run `npm run dev`; the user starts and manages the local dev server.
- Do not run Prisma migrations unless the user explicitly asks.
- If Prisma schema changes, run `npx prisma generate`. Run migrations only after approval/request.
- Use CAD for prices and PayPal currency.
- Keep email read-only on the profile page unless email verification is added.
- Prefer server components/actions for database reads and writes.
- Use React Hook Form with Zod for client forms when validation is needed.
- Use existing shadcn-style UI components before adding new primitives.

## Verification

Run these after meaningful code changes:

```bash
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

Do not run a production build unless there is a specific reason.

## Admin Notes

- Admin access is protected by `middleware.ts` and by `app/(root)/admin/layout.tsx`.
- Admin dashboard/products/orders/users currently use real Prisma data.
- Some admin action buttons are UI placeholders until create/edit/delete workflows are implemented.

## Date And Time

- Server date formatting can differ between local and Vercel.
- Use `components/shared/local-date-time.tsx` for times that should display in the viewer's machine timezone.
