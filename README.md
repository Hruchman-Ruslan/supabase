# Stripe + Supabase — Full-Stack Subscription Demo

This project was built to demonstrate real-world integration of **Stripe Payments** and **Supabase Auth** in a **Next.js 16** application. It showcases a complete subscription flow from user registration to paid access — the kind of feature commonly required in SaaS products.

---

> [!CAUTION]
> **THIS IS A TEST PROJECT — USE TEST CARD ONLY**
>
> Stripe is running in **test mode**. Do NOT enter a real credit card — it will charge real money.
>
> Use this test card instead:
>
> | Field | Value |
> |-------|-------|
> | Card number | `4242 4242 4242 4242` |
> | Expiry date | `12/26` |
> | CVC | `123` |
> | Name | Any name |
> | Country | Ukraine |
> | City | Kyiv |
> | Address | Khreshchatyk 1 |
> | ZIP | `01001` |

---

## Tech Stack

- **Next.js 16** — App Router, Server Actions, Middleware
- **Supabase** — Auth (email/password) + PostgreSQL + Row Level Security
- **Stripe** — Checkout Sessions, Webhooks, Subscription & One-time payments
- **Tailwind CSS** + **shadcn/ui**

## Features

- Email/password sign up & login with email confirmation
- Forgot password / reset password flow
- Two pricing plans: **Monthly** (recurring) and **Lifetime** (one-time)
- Stripe Checkout integration via Server Actions
- Stripe Webhook handler that syncs payment events to Supabase
- Middleware-based route protection — access to `/protected` requires active subscription
- Automatic cancellation of old subscription when upgrading to Lifetime
- Dark mode

## User Flow

```
Sign Up → Email Confirmation → Login → /pricing → Stripe Checkout → /protected
```

## Project Structure

```
app/
  auth/          # Login, sign-up, forgot/update password, email confirm
  pricing/       # Plan selection page
  protected/     # Subscription-gated dashboard
  api/stripe/    # Stripe webhook handler
components/      # UI components, auth forms
lib/
  stripe.ts          # Stripe client
  stripe-actions.ts  # Server Action: create checkout session
  supabase/          # Supabase server/client/middleware clients
```

