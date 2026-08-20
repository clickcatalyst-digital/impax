// Reconciles Turso with a fresh spreadsheet export (scripts/seed-data-latest.json,
// produced by scripts/extract_latest_data.py from an updated 26.1.26-1.xlsm).
//
// Matches existing items by their original identifying columns (group+name+subtype
// for stock, code+name for PCB) - the same keys scripts/seed.ts used to create them.
// For each match: updates price/minQty if changed, and adds one adjustment movement
// to bring the computed stock in line with the sheet's current STOCK column.
// Never deletes or archives anything. Items in the sheet with no DB match are
// inserted fresh (like seed.ts); DB items missing from the sheet are only reported.
//
// Dry run by default - prints the plan without writing. Pass --apply to write.
//
// Run with: npx tsx scripts/sync-latest.ts [--apply]

import { readFileSync } from "fs";
import { join } from "path";
import { and, eq, isNull, sql } from "drizzle-orm";
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

const APPLY = process.argv.includes("--apply");

function stockSubtype(row: StockRow) {
  const d = row.data,
    t = row.type;
  if (d && t && d !== t) return `${d} / ${t}`;
  return d || t || null;
}

async function currentStock(itemId: number) {
  const [row] = await db
    .select({
      qty: sql<number>`coalesce(sum(case when ${movements.direction} = 'in' then ${movements.qty} else -${movements.qty} end), 0)`,
    })
    .from(movements)
    .where(eq(movements.itemId, itemId));
  return Number(row?.qty ?? 0);
}

async function main() {
  const raw = readFileSync(join(__dirname, "seed-data-latest.json"), "utf-8");
  const data: { stock: StockRow[]; pcb: PcbRow[] } = JSON.parse(raw);

  const dbStock = await db.select().from(items).where(and(eq(items.category, "stock"), eq(items.isDeleted, "no")));
  const dbPcb = await db.select().from(items).where(and(eq(items.category, "pcb"), eq(items.isDeleted, "no")));

  const matchedStockIds = new Set<number>();
  const matchedPcbIds = new Set<number>();

  console.log(`\n=== STOCK (${data.stock.length} sheet rows, ${dbStock.length} DB items) ===`);
  for (const row of data.stock) {
    const subtype = stockSubtype(row);
    const dbItem = dbStock.find(
      (i) => (i.groupName || null) === (row.group || null) && i.name === row.item && (i.subtype || null) === subtype
    );

    if (!dbItem) {
      console.log(`NEW  ${row.group ?? ""} / ${row.item} / ${subtype ?? ""} -> insert, opening ${row.opening_balance}`);
      if (APPLY) {
        const [created] = await db
          .insert(items)
          .values({
            category: "stock",
            name: row.item,
            groupName: row.group,
            subtype,
            price: row.price || 0,
            minQty: row.min_qty || 0,
          })
          .returning();
        if (row.opening_balance) {
          await db.insert(movements).values({
            itemId: created.id,
            direction: row.opening_balance >= 0 ? "in" : "out",
            qty: Math.abs(row.opening_balance),
            note: "Opening balance (imported from updated spreadsheet)",
          });
        }
      }
      continue;
    }

    matchedStockIds.add(dbItem.id);
    const stock = await currentStock(dbItem.id);
    const diff = row.opening_balance - stock;
    const changes: string[] = [];
    if (diff !== 0) changes.push(`stock ${stock} -> ${row.opening_balance}`);
    if (dbItem.price !== (row.price || 0)) changes.push(`price ${dbItem.price} -> ${row.price || 0}`);
    if (dbItem.minQty !== (row.min_qty || 0)) changes.push(`min ${dbItem.minQty} -> ${row.min_qty || 0}`);

    if (changes.length === 0) continue;
    console.log(`~    ${row.group ?? ""} / ${row.item} / ${subtype ?? ""}: ${changes.join(", ")}`);

    if (APPLY) {
      if (diff !== 0) {
        await db.insert(movements).values({
          itemId: dbItem.id,
          direction: diff > 0 ? "in" : "out",
          qty: Math.abs(diff),
          note: "Reconciled to match updated spreadsheet (26.1.26-1)",
        });
      }
      if (dbItem.price !== (row.price || 0) || dbItem.minQty !== (row.min_qty || 0)) {
        await db
          .update(items)
          .set({ price: row.price || 0, minQty: row.min_qty || 0 })
          .where(eq(items.id, dbItem.id));
      }
    }
  }

  const unmatchedStock = dbStock.filter((i) => !matchedStockIds.has(i.id));
  if (unmatchedStock.length) {
    console.log(`\nIn DB but not in sheet (left untouched, review manually):`);
    for (const i of unmatchedStock) console.log(`  - [${i.id}] ${i.groupName ?? ""} / ${i.name} / ${i.subtype ?? ""}`);
  }

  console.log(`\n=== BLANK PCB (${data.pcb.length} sheet rows, ${dbPcb.length} DB items) ===`);
  for (const row of data.pcb) {
    const code = row.pcb_number != null ? String(row.pcb_number) : null;
    const dbItem = dbPcb.find((i) => (i.code || null) === code && i.name === row.name);

    if (!dbItem) {
      console.log(`NEW  ${code ?? ""} / ${row.name} -> insert, opening ${row.opening_balance}`);
      if (APPLY) {
        const [created] = await db
          .insert(items)
          .values({
            category: "pcb",
            name: row.name,
            code,
            price: row.price || 0,
            minQty: row.min_qty || 0,
          })
          .returning();
        if (row.opening_balance) {
          await db.insert(movements).values({
            itemId: created.id,
            direction: row.opening_balance >= 0 ? "in" : "out",
            qty: Math.abs(row.opening_balance),
            note: "Opening balance (imported from updated spreadsheet)",
          });
        }
      }
      continue;
    }

    matchedPcbIds.add(dbItem.id);
    const stock = await currentStock(dbItem.id);
    const diff = row.opening_balance - stock;
    const changes: string[] = [];
    if (diff !== 0) changes.push(`stock ${stock} -> ${row.opening_balance}`);
    if (dbItem.price !== (row.price || 0)) changes.push(`price ${dbItem.price} -> ${row.price || 0}`);
    if (dbItem.minQty !== (row.min_qty || 0)) changes.push(`min ${dbItem.minQty} -> ${row.min_qty || 0}`);

    if (changes.length === 0) continue;
    console.log(`~    ${code ?? ""} / ${row.name}: ${changes.join(", ")}`);

    if (APPLY) {
      if (diff !== 0) {
        await db.insert(movements).values({
          itemId: dbItem.id,
          direction: diff > 0 ? "in" : "out",
          qty: Math.abs(diff),
          note: "Reconciled to match updated spreadsheet (26.1.26-1)",
        });
      }
      if (dbItem.price !== (row.price || 0) || dbItem.minQty !== (row.min_qty || 0)) {
        await db
          .update(items)
          .set({ price: row.price || 0, minQty: row.min_qty || 0 })
          .where(eq(items.id, dbItem.id));
      }
    }
  }

  const unmatchedPcb = dbPcb.filter((i) => !matchedPcbIds.has(i.id));
  if (unmatchedPcb.length) {
    console.log(`\nIn DB but not in sheet (left untouched, review manually):`);
    for (const i of unmatchedPcb) console.log(`  - [${i.id}] ${i.code ?? ""} / ${i.name}`);
  }

  console.log(APPLY ? "\nApplied." : "\nDry run only - re-run with --apply to write these changes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
