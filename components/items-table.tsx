"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecordMovementDialog } from "@/components/record-movement-dialog";
import { updateItemAction, deleteItemAction } from "@/app/actions";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ItemWithStock } from "@/lib/db/queries";

type EditableField = "name" | "code" | "groupName" | "subtype" | "price" | "minQty";
type SortKey = EditableField | "stock" | "value";

function EditableCell({
  item,
  category,
  field,
  type = "text",
  align,
  display,
}: {
  item: ItemWithStock;
  category: "stock" | "pcb";
  field: EditableField;
  type?: "text" | "number";
  align?: "right";
  display?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function commit(raw: string) {
    setEditing(false);
    const value = type === "number" ? raw.trim() : raw;
    const current = field === "price" || field === "minQty" ? String(item[field]) : String(item[field] || "");
    if (value === current) return;

    const formData = new FormData();
    formData.set("id", String(item.id));
    formData.set("category", category);
    formData.set("name", field === "name" ? value : item.name);
    formData.set("code", field === "code" ? value : item.code || "");
    formData.set("groupName", field === "groupName" ? value : item.groupName || "");
    formData.set("subtype", field === "subtype" ? value : item.subtype || "");
    formData.set("price", field === "price" ? value : String(item.price));
    formData.set("minQty", field === "minQty" ? value : String(item.minQty));
    formData.set("remarks", item.remarks || "");
    startTransition(() => updateItemAction(formData));
  }

  if (editing) {
    return (
      <TableCell className={align === "right" ? "text-right" : undefined}>
        <Input
          autoFocus
          type={type}
          step={type === "number" ? "0.01" : undefined}
          defaultValue={String(item[field] ?? "")}
          className={cn("h-8", align === "right" && "text-right")}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      onDoubleClick={() => setEditing(true)}
      title="Double-click to edit"
      className={cn("cursor-text", align === "right" && "text-right tabular", pending && "opacity-50")}
    >
      {display ?? item[field] ?? "-"}
    </TableCell>
  );
}

function SortableHead({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
  align,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  direction: "asc" | "desc";
  onSort: (key: SortKey) => void;
  align?: "right";
}) {
  const active = activeKey === sortKey;
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground",
          align === "right" && "flex-row-reverse"
        )}
      >
        {label}
        <Icon className={cn("h-3 w-3 print:hidden", active ? "opacity-100" : "opacity-40")} />
      </button>
    </TableHead>
  );
}

export function ItemsTable({
  items,
  category,
}: {
  items: ItemWithStock[];
  category: "stock" | "pcb";
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [, startDelete] = useTransition();

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleDelete(item: ItemWithStock) {
    const confirmed = window.confirm(
      `Archive “${item.name}”? It will be hidden from inventory, but its movement history will be preserved.`
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", String(item.id));
    startDelete(() => deleteItemAction(formData));
  }

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [item.name, item.code, item.groupName, item.subtype, item.remarks]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [items, search]);

  const sortedItems = useMemo(() => {
    if (!sortKey) return filteredItems;
    const sorted = [...filteredItems].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av ?? "").localeCompare(String(bv ?? ""));
    });
    if (sortDir === "desc") sorted.reverse();
    return sorted;
  }, [filteredItems, sortKey, sortDir]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No items yet. Add your first one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between print:hidden">
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

      {sortedItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No items match “{search}”.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm shadow-black/[0.02] print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              {category === "stock" && (
                <SortableHead label="Group" sortKey="groupName" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
              )}
              <SortableHead
                label={category === "pcb" ? "Name" : "Item"}
                sortKey="name"
                activeKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              {category === "stock" && (
                <SortableHead label="Subtype" sortKey="subtype" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
              )}
              {category === "pcb" && (
                <SortableHead label="PCB No." sortKey="code" activeKey={sortKey} direction={sortDir} onSort={handleSort} />
              )}
              <SortableHead label="Stock" sortKey="stock" activeKey={sortKey} direction={sortDir} onSort={handleSort} align="right" />
              <SortableHead label="Min" sortKey="minQty" activeKey={sortKey} direction={sortDir} onSort={handleSort} align="right" />
              <SortableHead label="Price" sortKey="price" activeKey={sortKey} direction={sortDir} onSort={handleSort} align="right" />
              <SortableHead label="Value" sortKey="value" activeKey={sortKey} direction={sortDir} onSort={handleSort} align="right" />
              <TableHead className="print:hidden"></TableHead>
              <TableHead className="text-right print:hidden">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.id}>
                {category === "stock" && (
                  <EditableCell item={item} category={category} field="groupName" display={item.groupName || "-"} />
                )}
                <EditableCell item={item} category={category} field="name" />
                {category === "stock" && (
                  <EditableCell item={item} category={category} field="subtype" display={item.subtype || "-"} />
                )}
                {category === "pcb" && (
                  <EditableCell item={item} category={category} field="code" display={item.code || "-"} />
                )}
                <TableCell className="tabular text-right">{formatNumber(item.stock)}</TableCell>
                <EditableCell
                  item={item}
                  category={category}
                  field="minQty"
                  type="number"
                  align="right"
                  display={formatNumber(item.minQty)}
                />
                <EditableCell
                  item={item}
                  category={category}
                  field="price"
                  type="number"
                  align="right"
                  display={formatCurrency(item.price)}
                />
                <TableCell className="tabular text-right">{formatCurrency(item.value)}</TableCell>
                <TableCell>
                  {item.needsReorder && <Badge variant="amber">Reorder</Badge>}
                </TableCell>
                <TableCell className="text-right print:hidden">
                  <div className="flex items-center justify-end gap-2">
                    <RecordMovementDialog itemId={item.id} itemName={item.name} currentStock={item.stock} />
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={`Delete ${item.name}`}
                      title="Archive item"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
