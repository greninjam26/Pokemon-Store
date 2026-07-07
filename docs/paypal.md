# PayPal

## Environment Variables

The app uses these PayPal variables:

```env
PAYPAL_CLIENT_ID=
PAYPAL_APP_SECRET=
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
```

The default API URL is the PayPal sandbox API.

## Currency

PayPal currency is CAD:

```txt
PAYPAL_CURRENCY_CODE = "CAD"
```

## Flow

1. Customer selects PayPal as payment method.
2. Customer places order.
3. Order detail page shows PayPal button if the order is unpaid and payment method is PayPal.
4. `createPayPalOrder()` creates a PayPal order.
5. `approvePayPalOrder()` captures payment and marks the order paid.

## Notes

- Product stock is decremented when the order is placed, not when PayPal payment is captured.
- The PayPal button hides Pay Later and card funding options.
- Sandbox testing requires PayPal sandbox buyer/seller accounts.
