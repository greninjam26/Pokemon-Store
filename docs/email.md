# Email

## Environment Variables

The app uses Resend for order receipt emails:

```env
RESEND_API_KEY=
SENDER_EMAIL=
```

`SENDER_EMAIL` must be an address/domain allowed by your Resend account. For production, use a verified domain email such as:

```env
SENDER_EMAIL=Pokemon Store <orders@yourdomain.com>
```

## Receipt Flow

1. An order is marked paid by PayPal, Stripe, Stripe webhook, or admin cash-on-delivery action.
2. The app sends a receipt email to the order user's email address.
3. If email sending fails, the payment still stays successful and the issue is logged.

## Notes

- Resend test accounts may only send to verified recipient emails.
- Email receipts are sent after payment, not when an unpaid order is created.
