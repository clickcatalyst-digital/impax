// app/pcb/page.tsx

import { AddItemDialog } from "@/components/add-item-dialog";
import { ItemsTable } from "@/components/items-table";
import { getPcbItems } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function PcbPage() {
  const items = await getPcbItems();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Blank PCB</h1>
          <p className="text-sm text-muted-foreground">{items.length} items</p>
        </div>
        <AddItemDialog category="pcb" />
      </div>
      <ItemsTable items={items} category="pcb" />
    </div>
  );
}