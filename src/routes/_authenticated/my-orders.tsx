import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site/site-shell";
import { formatPKR } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/my-orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Asym Decor" },
      {
        name: "description",
        content: "Track the status of your Asym Decor website orders, from pending to delivered.",
      },
      { property: "og:title", content: "My Orders — Asym Decor" },
      { property: "og:description", content: "Track your Cash on Delivery orders." },
    ],
  }),
  component: MyOrdersPage,
});

type OrderRow = {
  id: string;
  product_name: string;
  quantity: number;
  total: number;
  status: string;
  channel: string;
  city: string;
  created_at: string;
};

const STATUS_TONE: Record<string, string> = {
  pending: "secondary",
  confirmed: "secondary",
  shipped: "secondary",
  delivered: "default",
  cancelled: "outline",
};

function MyOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, product_name, quantity, total, status, channel, city, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OrderRow[];
    },
  });

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-5 py-14 sm:py-20">
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 text-4xl">My orders</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          All orders are Cash on Delivery. We confirm each one on WhatsApp before dispatch.
        </p>

        <div className="mt-10 space-y-3">
          {isLoading ? (
            <>
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </>
          ) : (data ?? []).length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No orders yet — your website orders will appear here.
            </p>
          ) : (
            data!.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5"
              >
                <div>
                  <p className="text-base">{o.product_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Qty {o.quantity} · {o.city} ·{" "}
                    {new Date(o.created_at).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatPKR(Number(o.total))}</p>
                  <Badge
                    variant={
                      (STATUS_TONE[o.status] ?? "secondary") as "default" | "secondary" | "outline"
                    }
                    className="mt-1 capitalize"
                  >
                    {o.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </SiteShell>
  );
}
