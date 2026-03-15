import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId) break;

      if (session.mode === "payment") {
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("stripe_subscription_id")
          .eq("user_id", userId)
          .single();

        if (existing?.stripe_subscription_id) {
          await stripe.subscriptions.cancel(existing.stripe_subscription_id).catch(() => {});
        }
      }

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        status: "active",
        plan: session.mode === "payment" ? "lifetime" : "monthly",
        current_period_end: session.mode === "payment"
          ? null
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as any;
      await supabase
        .from("subscriptions")
        .update({
          status: "active",
          current_period_end: new Date(invoice.lines.data[0].period.end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", invoice.subscription);
      break;
    }

    case "customer.subscription.deleted":
    case "invoice.payment_failed": {
      const obj = event.data.object as any;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", obj.subscription ?? obj.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
