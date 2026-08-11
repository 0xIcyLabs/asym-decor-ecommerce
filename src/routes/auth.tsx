import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/site-shell";
import { LoginDialog } from "@/components/site/login-dialog";
import { BRAND } from "@/lib/store";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in — Home Decor" },
      {
        name: "description",
        content:
          "Log in with a 6-digit code sent to your email to place a website order and track your Home Decor orders.",
      },
      { property: "og:title", content: "Log in — Home Decor" },
      { property: "og:description", content: "Email code login for orders and order tracking." },
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
          We'll email you a 6-digit code — no password to remember.
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
