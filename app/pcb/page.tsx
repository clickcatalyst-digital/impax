// app/pcb/page.tsx

import { AddItemDialog } from "@/components/add-item-dialog";
import { ItemsTable } from "@/components/items-table";
import { getPcbItems } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PcbPage() {
  const items = await getPcbItems();

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Inventory</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Blank PCB</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage PCB inventory, quantities, and movements.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-card">{items.length} items</Badge>
          <AddItemDialog category="pcb" />
        </div>
      </div>
      <ItemsTable items={items} category="pcb" />
    </div>
  );
}
