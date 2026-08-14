// app/page.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReorderTable } from "@/components/reorder-table";
import { getDashboardTotals, getReorderList } from "@/lib/db/queries";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totals, reorder] = await Promise.all([getDashboardTotals(), getReorderList()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Live inventory summary across Stock and Blank PCB.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total items</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular">
            {formatNumber(totals.totalItems)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total stock value</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular">
            {formatCurrency(totals.totalValue)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Needs reorder</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular text-amber">
            {formatNumber(totals.reorderCount)}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold">Reorder list</h2>
          <p className="text-sm text-muted-foreground">
            Items where stock has fallen below their minimum — updates instantly, no refresh needed.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ReorderTable title="Stock" items={reorder.stock} />
          <ReorderTable title="Blank PCB" items={reorder.pcb} />
        </div>
      </div>
    </div>
  );
}
