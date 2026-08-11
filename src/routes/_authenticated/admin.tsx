import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin, useSession } from "@/hooks/use-session";
import { productImage, useProducts, type Product } from "@/lib/catalog";
import { CATEGORIES, ORDER_STATUSES, formatPKR } from "@/lib/store";
import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Home Decor" },
      { name: "description", content: "Manage Home Decor orders and product catalog." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Home Decor" },
      { property: "og:description", content: "Internal order and catalog management." },
    ],
  }),
  component: AdminPage,
});

type OrderRow = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  product_name: string;
  quantity: number;
  item_price: number;
  delivery_charge: number;
  total: number;
  channel: string;
  status: string;
  note: string | null;
  created_at: string;
};

function AdminPage() {
  const { user, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !roleLoading && isAdmin === false) {
      toast.error("This area is for store admins only.");
      navigate({ to: "/", replace: true });
    }
  }, [loading, roleLoading, isAdmin, navigate]);

  if (loading || roleLoading || !isAdmin) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-6xl px-5 py-24 text-center text-sm text-muted-foreground">
          Checking your access…
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 text-4xl">Store management</h1>
        <Tabs defaultValue="orders" className="mt-8">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
          </TabsList>
          <TabsContent value="orders" className="mt-6">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="catalog" className="mt-6">
            <CatalogTab />
          </TabsContent>
        </Tabs>
      </section>
    </SiteShell>
  );
}

function OrdersTab() {
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState("all");
  const [status, setStatus] = useState("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as OrderRow[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, next }: { id: string; next: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: next as (typeof ORDER_STATUSES)[number] })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(
    () =>
      (orders ?? []).filter(
        (o) => (channel === "all" || o.channel === channel) && (status === "all" || o.status === status),
      ),
    [orders, channel, status],
  );

  const stats = useMemo(() => {
    const list = orders ?? [];
    return {
      total: list.length,
      whatsapp: list.filter((o) => o.channel === "whatsapp").length,
      website: list.filter((o) => o.channel === "website").length,
      pending: list.filter((o) => o.status === "pending").length,
      delivered: list.filter((o) => o.status === "delivered").length,
    };
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total orders", value: stats.total },
          { label: "WhatsApp", value: stats.whatsapp },
          { label: "Website", value: stats.website },
          { label: "Pending", value: stats.pending },
          { label: "Delivered", value: stats.delivered },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="eyebrow">{s.label}</p>
            <p className="mt-1 font-display text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={channel} onValueChange={setChannel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="website">Website</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Loading orders…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No orders match these filters.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <p className="font-medium">{o.customer_name}</p>
                    <p className="max-w-52 text-xs text-muted-foreground">
                      {o.address}, {o.city}
                    </p>
                    {o.note ? <p className="text-xs text-muted-foreground">Note: {o.note}</p> : null}
                  </TableCell>
                  <TableCell className="text-xs">{o.phone}</TableCell>
                  <TableCell className="text-xs">{o.product_name}</TableCell>
                  <TableCell>{o.quantity}</TableCell>
                  <TableCell className="text-xs">{formatPKR(Number(o.item_price))}</TableCell>
                  <TableCell className="text-xs">{formatPKR(Number(o.delivery_charge))}</TableCell>
                  <TableCell className="text-xs font-medium">
                    {formatPKR(Number(o.total))}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {o.channel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={o.status}
                      onValueChange={(next) => updateStatus.mutate({ id: o.id, next })}
                    >
                      <SelectTrigger className="w-32 capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

type Draft = {
  name: string;
  category: string;
  price: string;
  description: string;
  in_stock: boolean;
  image_url: string | null;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  category: CATEGORIES[0],
  price: "",
  description: "",
  in_stock: true,
  image_url: null,
};

function CatalogTab() {
  const { data: products, isLoading } = useProducts();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted.");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" strokeWidth={1.5} /> Add Product
        </Button>
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading catalog…</p>
        ) : (
          (products ?? []).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-3"
            >
              <img
                src={productImage(p)}
                alt={p.name}
                loading="lazy"
                className="size-16 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  {p.category} · {formatPKR(Number(p.price))} ·{" "}
                  {p.in_stock ? "In stock" : "Sold out"}
                </p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(p)}>
                <Pencil className="size-4" strokeWidth={1.5} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete"
                onClick={() => setDeleteTarget(p)}
              >
                <Trash2 className="size-4" strokeWidth={1.5} />
              </Button>
            </div>
          ))
        )}
      </div>

      {creating ? <ProductFormDialog onClose={() => setCreating(false)} /> : null}
      {editing ? <ProductFormDialog product={editing} onClose={() => setEditing(null)} /> : null}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product from the shop. Past orders keep their details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && remove.mutate(deleteTarget.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductFormDialog({ product, onClose }: { product?: Product; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(
    product
      ? {
          name: product.name,
          category: product.category,
          price: String(product.price),
          description: product.description,
          in_stock: product.in_stock,
          image_url: product.image_url,
        }
      : EMPTY_DRAFT,
  );
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (error) throw error;
      const { data, error: signError } = await supabase.storage
        .from("product-images")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (signError) throw signError;
      set("image_url", data.signedUrl);
      toast.success("Image uploaded.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: draft.name.trim(),
        category: draft.category,
        price: Number(draft.price) || 0,
        description: draft.description.trim(),
        in_stock: draft.in_stock,
        image_url: draft.image_url,
      };
      if (!payload.name) throw new Error("Product name is required.");
      if (product) {
        const { error } = await supabase.from("products").update(payload).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(product ? "Product updated." : "Product added.");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {product ? "Edit product" : "Add product"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-cat">Category</Label>
              <Select value={draft.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger id="p-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-price">Price (PKR)</Label>
              <Input
                id="p-price"
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              rows={3}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-img">Image</Label>
            <Input
              id="p-img"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
            />
            {uploading ? <p className="text-xs text-muted-foreground">Uploading…</p> : null}
            {draft.image_url ? (
              <img
                src={draft.image_url}
                alt="Product preview"
                className="mt-2 size-24 rounded-lg object-cover"
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                No image yet — a category placeholder is shown in the shop.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="p-stock">In stock</Label>
            <Switch
              id="p-stock"
              checked={draft.in_stock}
              onCheckedChange={(v) => set("in_stock", v)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending || uploading}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
