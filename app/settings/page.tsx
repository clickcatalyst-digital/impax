import { KeyRound, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/change-password-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Workspace</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account preferences and access.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm shadow-black/[0.02]">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="font-semibold">Account security</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user.username}</span>. Your password is stored securely as a salted hash.
          </p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm shadow-black/[0.02] sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-semibold">Change password</h2>
              <p className="text-sm text-muted-foreground">Use a password you do not reuse elsewhere.</p>
            </div>
          </div>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
