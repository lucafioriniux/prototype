# Modus 3D — Stripe & Shipping Integration Guide
*Production-ready setup to accept credit cards, Apple Pay, and shipping fulfillment.*

---

## 1. Overview
The **Modus 3D** codebase is structured with an abstracted checkout service layer (`src/services/checkout.ts`) and a serverless endpoint (`api/create-checkout-session.ts`). 

You do **not** need to rewrite any frontend UI when you are ready to accept real payments. You only need to plug in your Stripe API keys.

---

## 2. Step-by-Step Stripe Account Setup (10 Minutes)

### Step 1: Create a Free Stripe Account
1. Go to **[dashboard.stripe.com/register](https://dashboard.stripe.com/register)** and sign up.
2. Once inside your dashboard, you will be in **Test Mode** by default (toggle in the top-right corner).
3. Go to **Developers $\rightarrow$ API Keys** and copy:
   - **Publishable Key**: starts with `pk_test_...`
   - **Secret Key**: starts with `sk_test_...`

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your keys:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
VITE_API_URL=/api
```

---

## 3. Shipping & Address Collection

The backend endpoint (`api/create-checkout-session.ts`) is pre-configured to automatically collect full shipping addresses:

```typescript
shipping_address_collection: {
  allowed_countries: ['US', 'CA'], // Add other countries as needed
},
shipping_options: [
  {
    shipping_rate_data: {
      type: 'fixed_amount',
      fixed_amount: { amount: cartSubtotal >= 35 ? 0 : 499, currency: 'usd' },
      display_name: cartSubtotal >= 35 ? 'Free Standard Shipping' : 'Standard Shipping (USPS)',
      delivery_estimate: {
        minimum: { unit: 'business_day', value: 3 },
        maximum: { unit: 'business_day', value: 5 },
      },
    },
  },
]
```

---

## 4. Automatic Order Fulfillment (Shippo / Pirate Ship)

When orders come in through Stripe, you can generate shipping labels automatically with zero manual data entry:

1. Create a free account at **[goshippo.com](https://goshippo.com)** or **[pirateship.com](https://pirateship.com)**.
2. In Shippo/Pirate Ship, go to **Settings $\rightarrow$ Integrations $\rightarrow$ Connect Stripe**.
3. Every completed order on Modus 3D will automatically show up with:
   - Customer name & address
   - Custom 3D print item line items (Material, Color, Infill %, Dyson Model)
4. Buy discounted commercial USPS Ground Advantage or UPS labels with 1 click. Tracking numbers are automatically emailed to the customer.

---

## 5. Deployment Options for the Stripe Backend

Since GitHub Pages only hosts static files, the small `api/` serverless function can be hosted for **free** on either:
- **Vercel** (connects to your GitHub repo in 30 seconds, runs `api/` automatically).
- **Cloudflare Workers** (ultra-fast serverless execution).
- **Netlify** (supports native `/api` functions).
