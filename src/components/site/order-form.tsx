import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { LoginDialog } from "@/components/site/login-dialog";
import { type Product } from "@/lib/catalog";
import {
  BRAND,
  CITIES,
  buildWhatsappMessage,
  deliveryChargeFor,
  formatPKR,
  whatsappLink,
  type OrderDraft,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Truck, Check } from "lucide-react";

const EMPTY: OrderDraft = {
  customer_name: "",
  phone: "",
  address: "",
  city: "Lahore",
  quantity: 1,
  note: "",
};

export function OrderForm({ product, onDone }: { product: Product; onDone?: () => void }) {
  const [draft, setDraft] = useState<OrderDraft>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const { user } = useSession();
  const queryClient = useQueryClient();

  const delivery = deliveryChargeFor(draft.city);
  const subtotal = Number(product.price) * draft.quantity;
  const total = subtotal + delivery;

  const valid = useMemo(
    () =>
      draft.customer_name.trim().length >= 3 &&
      draft.phone.replace(/\D/g, "").length >= 10 &&
      draft.address.trim().split(/\s+/).filter(Boolean).length >= 2 &&
      draft.quantity > 0,
    [draft],
  );

  function set<K extends keyof OrderDraft>(key: K, value: OrderDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function saveOrder(channel: "whatsapp" | "website") {
    const { error } = await supabase.from("orders").insert({
      customer_name: draft.customer_name.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
      city: draft.city,
      product_id: product.id,
      product_name: product.name,
      quantity: draft.quantity,
      item_price: Number(product.price),
      delivery_charge: delivery,
      total,
      note: draft.note.trim() || null,
      channel,
      status: "pending",
      user_id: channel === "website" ? (user?.id ?? null) : null,
    });
    if (error) throw error;
  }

  async function orderViaWhatsapp() {
    if (!valid) return;
    setBusy(true);
    try {
      await saveOrder("whatsapp");
      const url = whatsappLink(
        buildWhatsappMessage({
          productName: product.name,
          draft,
          itemPrice: Number(product.price),
          delivery,
          total,
        }),
      );
      window.open(url, "_blank", "noopener");
      toast.success("Order saved — finish the chat on WhatsApp.");
      onDone?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your order.");
    } finally {
      setBusy(false);
    }
  }

  async function orderOnSite() {
    if (!valid) return;
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setBusy(true);
    try {
      await saveOrder("website");
      await queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      setPlaced(true);
      toast.success("Order placed! We'll confirm on WhatsApp shortly.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place your order.");
    } finally {
      setBusy(false);
    }
  }

  if (placed) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-accent">
          <Check className="size-5 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="mt-4 text-2xl">Order received</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Thank you, {draft.customer_name.split(" ")[0]}. Your order for {product.name} is{" "}
          <strong>pending</strong> and payable in cash on delivery — {formatPKR(total)}. Track it any
          time under <strong>My Orders</strong>.
        </p>
        <Button className="mt-6" variant="outline" onClick={onDone}>
          Continue browsing
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="of-name">Full name *</Label>
          <Input
            id="of-name"
            value={draft.customer_name}
            onChange={(e) => set("customer_name", e.target.value)}
            placeholder="Ayesha Khan"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-phone">Phone number *</Label>
          <Input
            id="of-phone"
            inputMode="tel"
            value={draft.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="0300 1234567"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-city">City *</Label>
          <Select value={draft.city} onValueChange={(v) => set("city", v)}>
            <SelectTrigger id="of-city">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="of-address">Complete address *</Label>
          <Textarea
            id="of-address"
            rows={2}
            value={draft.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="House / street / area, nearest landmark"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-qty">Quantity</Label>
          <Input
            id="of-qty"
            type="number"
            min={1}
            max={20}
            value={draft.quantity}
            onChange={(e) => set("quantity", Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="of-note">Note (optional)</Label>
          <Input
            id="of-note"
            value={draft.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="Gift wrap, delivery timing…"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/60 p-4">
        <p className="eyebrow">Order summary</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {product.name} × {draft.quantity}
            </span>
            <span>{formatPKR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery — {draft.city}</span>
            <span>{formatPKR(delivery)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-base">
            <span>Total</span>
            <span className="font-medium">{formatPKR(total)}</span>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Truck className="size-3.5" strokeWidth={1.5} />
          Cash on Delivery only — pay the courier when your parcel arrives.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="outline" disabled={!valid || busy} onClick={orderViaWhatsapp}>
          <MessageCircle className="size-4" strokeWidth={1.5} />
          Order via WhatsApp
        </Button>
        <Button disabled={!valid || busy} onClick={orderOnSite}>
          Place Order on Website
        </Button>
      </div>
      {!valid ? (
        <p className="text-center text-xs text-muted-foreground">
          Fill in your name, phone and address (at least 2 words) to enable ordering.
        </p>
      ) : null}

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        title="Quick login to order"
        description={`Website orders need a quick email login so you can track them. ${BRAND} never asks for payment online.`}
        onSuccess={orderOnSite}
      />
    </div>
  );
}
