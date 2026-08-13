import { useState } from "react";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
};

export function LoginDialog({ open, onOpenChange, onSuccess, title, description }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function sendLink() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("We emailed you a verification link.");
  }

  function close() {
    setEmail("");
    setSent(false);
    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title ?? "Log in"}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {description ??
            "Enter your email and we'll send you a verification link — no password to remember."}
        </p>
        {!sent ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendLink()}
              />
            </div>
            <Button className="w-full" onClick={sendLink} disabled={busy}>
              {busy ? "Sending…" : "Send verification link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <MailCheck className="mx-auto h-10 w-10 text-primary" />
            <p className="text-sm">
              We sent a verification link to <strong>{email}</strong>. Click the link in your email to
              verify and continue.
            </p>
            <div className="flex flex-col gap-2">
              <Button className="w-full" onClick={close}>
                Continue
              </Button>
              <button
                type="button"
                className="w-full text-xs text-muted-foreground underline"
                onClick={() => setSent(false)}
              >
                Use a different email
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
