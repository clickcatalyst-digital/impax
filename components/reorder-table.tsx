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
    <div>
      <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
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
