import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/site-shell";
import { LoginDialog } from "@/components/site/login-dialog";
import { BRAND } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Log in — ${BRAND}` },
      {
        name: "description",
        content:
          `Log in with a verification link sent to your email to place a website order and track your ${BRAND} orders.`,
      },
      { property: "og:title", content: `Log in — ${BRAND}` },
      { property: "og:description", content: "Email verification link login for orders and order tracking." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  return (
    <SiteShell>
      <section className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 text-4xl">Log in to {BRAND}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We'll email you a verification link — no password to remember.
        </p>
        <div className="mt-8">
          <LoginDialog
            open
            onOpenChange={(open) => {
              if (!open) navigate({ to: "/" });
            }}
            onSuccess={() => navigate({ to: "/my-orders" })}
          />
        </div>
      </section>
    </SiteShell>
  );
}
