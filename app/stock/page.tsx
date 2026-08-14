// app/stock/page.tsx

import { AddItemDialog } from "@/components/add-item-dialog";
import { ItemsTable } from "@/components/items-table";
import { getStockItems } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const items = await getStockItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Stock</h1>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>
        <AddItemDialog category="stock" />
      </div>
      <ItemsTable items={items} category="stock" />
    </div>
  );
}
