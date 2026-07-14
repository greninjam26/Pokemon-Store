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

Apply production migrations before deploying code that depends on new schema fields.

## Seed

Seed data lives in:

```txt
db/simple-data.ts
db/seed.ts
```

Run the configured seed command:

```bash
npx prisma db seed
```

The sample products are Pokemon TCG products. Product images are stored under `public/images/sample-products`.

## Model Notes

The database includes product, user, auth, cart, order, order item, and review models. The user model also has `orderHistoryPageSize` for account order history pagination.

Product stock is decremented when an order is placed. Unpaid online-payment orders can expire and return stock to products.
