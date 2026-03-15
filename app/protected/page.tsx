import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProtectedPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/auth/login");

  const { success } = await searchParams;
  const email = user.email;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan, current_period_end")
    .eq("user_id", user.id)
    .single();

  const plan = subscription?.plan;
  const renewDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="w-full border-b border-b-foreground/10 h-16 flex items-center px-6 justify-between">
        <Link href="/protected" className="font-semibold">App</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{email}</span>
          <LogoutButton />
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-2xl mx-auto w-full">

        {success === "true" ? (
          <div className="w-full flex flex-col items-center gap-4 py-10 border rounded-xl bg-green-500/10 border-green-500/30">
            <CheckCircle className="text-green-500" size={64} />
            <h1 className="text-2xl font-bold">Payment successful!</h1>
            <p className="text-muted-foreground text-center">
              {plan === "monthly"
                ? `Monthly plan active. Renews ${renewDate}.`
                : "Lifetime access activated. Enjoy forever!"}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/pricing">Manage subscription</Link>
            </Button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Welcome back!</h1>
              <Button asChild variant="outline" size="sm">
                <Link href="/pricing">Manage subscription</Link>
              </Button>
            </div>

            <div className="w-full flex items-center gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/10">
              <CheckCircle className="text-green-500 shrink-0" size={20} />
              <div>
                <p className="font-medium">Subscription active</p>
                <p className="text-sm text-muted-foreground">
                  {plan === "lifetime"
                    ? "Lifetime access · Never expires"
                    : `Monthly plan · Renews ${renewDate}`}
                </p>
              </div>
            </div>

            <p className="text-muted-foreground">This is where the main app content goes.</p>
          </div>
        )}

      </div>
    </div>
  );
}
