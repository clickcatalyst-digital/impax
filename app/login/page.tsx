import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_36%),hsl(var(--background))] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl shadow-primary/10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground/15 text-sm font-bold">I</div>
                <span className="font-semibold tracking-tight">Impax Inventory</span>
              </div>
              <p className="max-w-sm text-3xl font-semibold leading-tight tracking-tight">
                Keep every item, movement, and reorder decision in view.
              </p>
            </div>
            <p className="text-sm text-primary-foreground/65">Simple inventory control for the Impax team.</p>
          </div>
          <div className="p-7 sm:p-10">
            <div className="mb-8 lg:hidden">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">I</div>
                <span className="font-semibold tracking-tight">Impax Inventory</span>
              </div>
            </div>
            <div className="mb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Welcome back</p>
              <h1 className="text-2xl font-semibold tracking-tight">Sign in to your workspace</h1>
              <p className="mt-2 text-sm text-muted-foreground">Use your Impax account to continue.</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
