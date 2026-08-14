import { and, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { items, movements, type Item, type NewItem, type NewMovement } from "./schema";

export type ItemWithStock = Item & {
  stock: number;
  value: number;
  needsReorder: boolean;
};

async function getItemsByCategory(category: "stock" | "pcb"): Promise<ItemWithStock[]> {
  const rows = await db
    .select({
      id: items.id,
      category: items.category,
      code: items.code,
      name: items.name,
      groupName: items.groupName,
      subtype: items.subtype,
      price: items.price,
      minQty: items.minQty,
      remarks: items.remarks,
      isDeleted: items.isDeleted,
      createdAt: items.createdAt,
      stock: sql<number>`coalesce(sum(case when ${movements.direction} = 'in' then ${movements.qty} else -${movements.qty} end), 0)`,
    })
    .from(items)
    .leftJoin(movements, eq(movements.itemId, items.id))
    .where(and(eq(items.category, category), eq(items.isDeleted, "no")))
    .groupBy(items.id)
    .orderBy(items.name);

  return rows.map((r) => {
    const stock = Number(r.stock);
    return {
      ...r,
      stock,
      value: stock * r.price,
      needsReorder: stock < r.minQty,
    };
  });
}

export const getStockItems = () => getItemsByCategory("stock");
export const getPcbItems = () => getItemsByCategory("pcb");

// This is the whole replacement for the old CreateOrderSheet macro:
// a live filter instead of a copy-paste-on-edit rebuild.
export async function getReorderList() {
  const [stock, pcb] = await Promise.all([getStockItems(), getPcbItems()]);
  return {
    stock: stock.filter((i) => i.needsReorder),
    pcb: pcb.filter((i) => i.needsReorder),
  };
}

export async function getDashboardTotals() {
  const [stock, pcb] = await Promise.all([getStockItems(), getPcbItems()]);
  const all = [...stock, ...pcb];
  return {
    totalItems: all.length,
    totalValue: all.reduce((sum, i) => sum + i.value, 0),
    reorderCount: all.filter((i) => i.needsReorder).length,
  };
}

export async function addItem(data: NewItem) {
  const [row] = await db.insert(items).values(data).returning();
  return row;
}

export async function recordMovement(data: NewMovement) {
  const [row] = await db.insert(movements).values(data).returning();
  return row;
}

export async function updateItem(
  id: number,
  data: Pick<NewItem, "code" | "name" | "groupName" | "subtype" | "price" | "minQty" | "remarks">
) {
  const [row] = await db.update(items).set(data).where(eq(items.id, id)).returning();
  return row;
}

export async function deleteItem(id: number) {
  const [row] = await db
    .update(items)
    .set({ isDeleted: "yes" })
    .where(eq(items.id, id))
    .returning();
  return row;
}

export async function getItemMovements(itemId: number) {
  return db
    .select()
    .from(movements)
    .where(eq(movements.itemId, itemId))
    .orderBy(sql`${movements.createdAt} desc`);
}
