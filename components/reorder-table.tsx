import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import type { ItemWithStock } from "@/lib/db/queries";

export function ReorderTable({
  title,
  items,
}: {
  title: string;
  items: ItemWithStock[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm shadow-black/[0.02]">
      <div className="border-b border-border/70 px-5 py-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">Items below minimum quantity</p>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          Nothing below minimum right now.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Min</TableHead>
              <TableHead className="text-right">Short by</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="tabular text-right">{formatNumber(item.stock)}</TableCell>
                <TableCell className="tabular text-right text-muted-foreground">
                  {formatNumber(item.minQty)}
                </TableCell>
                <TableCell className="tabular text-right text-amber">
                  {formatNumber(item.minQty - item.stock)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
