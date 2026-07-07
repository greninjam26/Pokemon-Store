# Database

## Prisma

Schema:

```txt
prisma/schema.prisma
```

Generated client:

```txt
lib/generated/prisma
```

Prisma wrapper:

```txt
db/prisma.ts
```

## Commands

Validate schema:

```bash
npx prisma validate
```

Generate client:

```bash
npx prisma generate
```

Check migration status:

```bash
npx prisma migrate status
```

Create and apply a migration:

```bash
npx prisma migrate dev --name migration-name
```

Only run migrations when the project owner asks.

## Seed

Seed data lives in:

```txt
db/simple-data.ts
db/seed.ts
```

The sample products are Pokemon TCG products. Product images are stored under `public/images/sample-products`.

## Current Migration Notes

The database includes product, user, auth, cart, order, and order item models. The user model also has `orderHistoryPageSize` for account order history pagination.
