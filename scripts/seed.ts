// One-time import of the existing spreadsheet data into Turso.
// Run with: npm run db:seed
//
// Each item's current quantity becomes a single opening "in" movement,
// so the ledger has a real starting point instead of every item
// showing zero stock on day one.

import { readFileSync } from "fs";
import { join } from "path";
import { db } from "../lib/db/client";
import { items, movements } from "../lib/db/schema";

type StockRow = {
  group: string | null;
  item: string;
  data: string | null;
  type: string | null;
  opening_balance: number;
  price: number;
  min_qty: number;
};

type PcbRow = {
  pcb_number: string | number | null;
  name: string;
  opening_balance: number;
  price: number;
  min_qty: number;
};

async function main() {
  const raw = readFileSync(join(__dirname, "seed-data.json"), "utf-8");
  const data: { stock: StockRow[]; pcb: PcbRow[] } = JSON.parse(raw);

  console.log(`Importing ${data.stock.length} stock items and ${data.pcb.length} PCB items...`);

  for (const row of data.stock) {
    const [item] = await db
      .insert(items)
      .values({
        category: "stock",
        name: row.item,
        groupName: row.group,
        subtype: row.data && row.type && row.data !== row.type ? `${row.data} / ${row.type}` : row.data || row.type,
        price: row.price || 0,
        minQty: row.min_qty || 0,
      })
      .returning();

    if (row.opening_balance) {
      await db.insert(movements).values({
        itemId: item.id,
        direction: "in",
        qty: Math.abs(row.opening_balance),
        note: "Opening balance (imported from spreadsheet)",
      });
    }
  }

  for (const row of data.pcb) {
    const [item] = await db
      .insert(items)
      .values({
        category: "pcb",
        name: row.name,
        code: row.pcb_number != null ? String(row.pcb_number) : null,
        price: row.price || 0,
        minQty: row.min_qty || 0,
      })
      .returning();

    if (row.opening_balance) {
      await db.insert(movements).values({
        itemId: item.id,
        direction: "in",
        qty: Math.abs(row.opening_balance),
        note: "Opening balance (imported from spreadsheet)",
      });
    }
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
