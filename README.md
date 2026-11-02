# TOPUP GAMING V.

Starter project for a Thai-baht game top-up store with manual fulfillment.

## Included
- Next.js storefront landing page for six games
- PostgreSQL + Prisma data model
- Seed data for game catalog and input fields
- Create-order API that calculates price from the database (not client input)
- Order status lookup API
- Admin dashboard wireframe

## Important status
This is a development starter, NOT a production-ready payment or fulfillment system.
The `/admin` page is only a visual wireframe. Authentication, role enforcement, payment verification, upload storage, rate limiting, CSRF protections, and customer notifications must be completed before public launch.

## Requirements
- Node.js 20+
- PostgreSQL database

## Setup
1. Copy `.env.example` to `.env` and configure `DATABASE_URL`.
2. Install packages: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Create tables: `npx prisma db push`
5. Seed games: `npm run db:seed`
6. Start locally: `npm run dev`

Open http://localhost:3000.

## Payment design
Configured store payment methods:
- PromptPay QR
- Bank transfer
- TrueMoney Wallet

For the first release, use a verified manual process:
1. Customer creates an order.
2. Backend creates a pending payment record using an allow-listed method.
3. Customer submits payment reference/proof through a private upload service.
4. Admin verifies the payment against the receiving account transaction.
5. Only the server-side admin action may set payment status to VERIFIED and order status to PAID.

Never trust an uploaded slip image as proof of payment by itself. Do not expose bank account secrets, wallet credentials, or payment gateway keys in client code.

## Manual fulfillment
After payment verification, create a fulfillment record with QUEUED status. An authenticated admin processes the top-up through the store's approved channel, records a note/reference, then marks it COMPLETED or FAILED. Failed orders should enter a review/refund workflow.

## Production checklist
- Implement secure admin/customer authentication and authorization.
- Add server-side admin actions with audit logs and transaction-safe state transitions.
- Add private object storage for slips; validate MIME type, size, and malware scanning.
- Add payment-method configuration page with masked sensitive details.
- Add order checkout UI and payment submission UI.
- Add admin queue filters and fulfillment actions.
- Add email/phone notifications if desired.
- Add rate limits, idempotency keys, database backups, monitoring, HTTPS and privacy/terms pages.
- Verify each game's required player identifiers and permitted top-up channel before selling packages.
- Configure real package names, selling prices and costs; no prices are seeded by default.
- Obtain merchant/payment provider approval where required.

## API
`POST /api/orders`
```json
{
  "packageId": "valid-package-uuid",
  "quantity": 1,
  "playerData": { "player_uid": "123456789" },
  "customerEmail": "buyer@example.com"
}
```

`GET /api/orders/TGV-...` returns a limited order status view.

Do not deploy publicly until the production checklist is complete.


## Admin dashboard setup (development build)
1. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `ADMIN_SESSION_SECRET` in `.env`.
2. Generate a bcrypt hash locally with:
   `node -e "require('bcryptjs').hash('YOUR_LONG_PASSWORD', 12).then(console.log)"`
3. Run `npm install`, `npx prisma db push`, then `npm run dev`.
4. Visit `/admin` and sign in with the configured admin credentials.

Admin API routes require a signed, HTTP-only, SameSite=Strict cookie. The dashboard supports listing orders, manually verifying/rejecting payment, starting manual fulfillment, and recording completed/failed fulfillment with audit logs.

Before public deployment, add rate limiting to login, stronger CSRF/origin controls, robust payment transaction reconciliation, private proof upload storage, order/payment idempotency, refund workflow, and operational monitoring. Configure a real merchant-approved payment process; this starter intentionally does not pretend to verify PromptPay/bank/TrueMoney transactions automatically.
