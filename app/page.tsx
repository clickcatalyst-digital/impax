// app/page.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReorderTable } from "@/components/reorder-table";
import { getDashboardTotals, getReorderList } from "@/lib/db/queries";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totals, reorder] = await Promise.all([getDashboardTotals(), getReorderList()]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Overview</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live inventory summary across Stock and Blank PCB.
        </p>
        </div>
        <Badge variant="outline" className="w-fit bg-card">Live inventory</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Total items</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight tabular">
            {formatNumber(totals.totalItems)}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Total stock value</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight tabular">
            {formatCurrency(totals.totalValue)}
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Needs reorder</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight tabular text-amber">
            {formatNumber(totals.reorderCount)}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Reorder list</h2>
          <p className="text-sm text-muted-foreground">
            Items where stock has fallen below their minimum — updates instantly, no refresh needed.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ReorderTable title="Stock" items={reorder.stock} />
          <ReorderTable title="Blank PCB" items={reorder.pcb} />
        </div>
      </div>
    </div>
  );
}
