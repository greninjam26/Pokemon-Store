# Stripe

## Environment Variables

The app uses these Stripe variables:

```env
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Use Stripe test keys locally and in preview deployments. Use live keys only when the store is ready to accept real card payments.

## Currency

Stripe currency is CAD:

```txt
STRIPE_CURRENCY_CODE = "cad"
```

Stripe expects the currency code to be lowercase.

## Flow

1. Customer selects Credit Card as payment method.
2. Customer places order.
3. Order detail page shows the Stripe card form if the order is unpaid and payment method is Credit Card.
4. `createStripePaymentIntent()` creates or reuses a Stripe PaymentIntent.
5. The browser confirms the card payment with Stripe.
6. `approveStripePayment()` verifies the PaymentIntent on the server and marks the order paid.
7. Stripe also sends `payment_intent.succeeded` to `/api/webhooks/stripe`, which marks the order paid if the browser flow did not finish.

## Notes

- Product stock is decremented when the order is placed, not when Stripe payment is confirmed.
- Unpaid credit-card orders expire like unpaid PayPal orders, returning items to stock.
- Test payments use Stripe test cards, such as `4242 4242 4242 4242`.
- Webhooks require the endpoint signing secret from the Stripe dashboard or Stripe CLI.
