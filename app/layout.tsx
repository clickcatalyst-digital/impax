// app/layout.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { Cog, LogOut, Package2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Stock and PCB inventory tracking",
};

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/stock", label: "Stock" },
  { href: "/pcb", label: "Blank PCB" },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          {user && (
            <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur print:hidden">
              <div className="container flex flex-wrap items-center justify-between gap-3 py-3 sm:h-16 sm:flex-nowrap sm:py-0">
                <Link href="/" className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Package2 className="h-4 w-4" />
                  </span>
                  <span className="hidden text-sm font-semibold tracking-tight sm:inline">Impax Inventory</span>
                </Link>
                <nav className="order-3 flex w-full items-center justify-center gap-1 rounded-lg bg-muted/70 p-1 sm:order-none sm:w-auto sm:justify-start">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground sm:text-sm"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="flex items-center gap-2">
                  <span className="hidden text-xs text-muted-foreground md:inline">{user.username}</span>
                  <Button asChild type="button" size="icon" variant="ghost">
                    <Link href="/settings" aria-label="Settings" title="Settings">
                      <Cog className="h-4 w-4" />
                    </Link>
                  </Button>
                  <form action={logoutAction}>
                    <Button type="submit" size="icon" variant="ghost" aria-label="Sign out" title="Sign out">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </header>
          )}
          <main className={user ? "container flex-1 py-8 sm:py-10" : "flex-1"}>{children}</main>
        </div>
      </body>
    </html>
  );
}
