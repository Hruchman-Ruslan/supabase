import { createCheckoutSession } from "@/lib/stripe-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function PricingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  let currentPlan: string | null = null;

  if (data?.claims) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", data.claims.sub)
      .single();

    if (subscription?.status === "active") {
      currentPlan = subscription.plan;
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full border-b border-b-foreground/10 h-16 flex items-center px-6 justify-between">
        <Link href="/protected" className="font-semibold">App</Link>
        <LogoutButton />
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Choose your plan</h1>
          <p className="text-muted-foreground mt-2">Get full access. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">

          {/* Monthly */}
          <Card className={`flex flex-col ${currentPlan === "monthly" ? "border-green-500" : ""}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Monthly</CardTitle>
                {currentPlan === "monthly" && <CheckCircle className="text-green-500" size={20} />}
              </div>
              <CardDescription>Full access, billed monthly</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-4xl font-bold">zł1.00<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>✓ Full access to all questions</li>
                <li>✓ Cancel anytime</li>
              </ul>
            </CardContent>
            <CardFooter>
              <form action={createCheckoutSession.bind(null, process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!)} className="w-full">
                <Button type="submit" className="w-full" disabled={currentPlan === "monthly"}>
                  {currentPlan === "monthly" ? "Current plan" : "Subscribe monthly"}
                </Button>
              </form>
            </CardFooter>
          </Card>

          {/* Lifetime */}
          <Card className={`flex flex-col ${currentPlan === "lifetime" ? "border-green-500" : "border-primary"}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lifetime</CardTitle>
                {currentPlan === "lifetime" && <CheckCircle className="text-green-500" size={20} />}
              </div>
              <CardDescription>One-time payment, forever access</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-4xl font-bold">zł2.00<span className="text-base font-normal text-muted-foreground"> once</span></p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>✓ Full access forever</li>
                <li>✓ All future updates</li>
                <li>✓ Best value</li>
              </ul>
            </CardContent>
            <CardFooter>
              <form action={createCheckoutSession.bind(null, process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME!)} className="w-full">
                <Button type="submit" className="w-full" disabled={currentPlan === "lifetime"}>
                  {currentPlan === "lifetime" ? "Current plan" : "Get lifetime access"}
                </Button>
              </form>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}
