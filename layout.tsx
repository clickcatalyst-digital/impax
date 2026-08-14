import type { Metadata } from "next";
import Link from "next/link";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-border bg-card">
            <div className="container flex h-14 items-center justify-between">
              <span className="text-sm font-semibold tracking-tight">Inventory</span>
              <nav className="flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="container flex-1 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
