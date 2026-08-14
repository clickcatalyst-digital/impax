"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditItemDialog } from "@/components/edit-item-dialog";
import { RecordMovementDialog } from "@/components/record-movement-dialog";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { ItemWithStock } from "@/lib/db/queries";

export function ItemsTable({
  items,
  category,
}: {
  items: ItemWithStock[];
  category: "stock" | "pcb";
}) {
  const [search, setSearch] = useState("");
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [item.name, item.code, item.groupName, item.subtype, item.remarks]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [items, search]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No items yet. Add your first one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={category === "pcb" ? "Search by name or PCB number..." : "Search items..."}
            aria-label={`Search ${category === "pcb" ? "PCB" : "stock"} items`}
            className="pl-9"
          />
        </div>
        {search && (
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} of {items.length} items
          </p>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No items match “{search}”.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm shadow-black/[0.02]">
        <Table>
          <TableHeader>
            <TableRow>
              {category === "stock" && <TableHead>Group</TableHead>}
              <TableHead>{category === "pcb" ? "Name" : "Item"}</TableHead>
              {category === "stock" && <TableHead>Subtype</TableHead>}
              {category === "pcb" && <TableHead>PCB No.</TableHead>}
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Min</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead></TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
                {category === "stock" && (
                  <TableCell className="text-muted-foreground">{item.groupName || "-"}</TableCell>
                )}
                <TableCell className="font-medium">{item.name}</TableCell>
                {category === "stock" && (
                  <TableCell className="text-muted-foreground">{item.subtype || "-"}</TableCell>
                )}
                {category === "pcb" && (
                  <TableCell className="text-muted-foreground">{item.code || "-"}</TableCell>
                )}
                <TableCell className="tabular text-right">{formatNumber(item.stock)}</TableCell>
                <TableCell className="tabular text-right text-muted-foreground">
                  {formatNumber(item.minQty)}
                </TableCell>
                <TableCell className="tabular text-right">{formatCurrency(item.price)}</TableCell>
                <TableCell className="tabular text-right">{formatCurrency(item.value)}</TableCell>
                <TableCell>
                  {item.needsReorder && <Badge variant="amber">Reorder</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <EditItemDialog item={item} category={category} />
                    <RecordMovementDialog itemId={item.id} itemName={item.name} currentStock={item.stock} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      )}
    </div>
  );
}
