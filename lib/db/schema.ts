import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// One row per stock-keeping item, shared by both STOCK and BLANK PCB
// categories. `category` is what used to be two separate spreadsheet
// tabs — kept as a column instead so both live in one simple table.
export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category", { enum: ["stock", "pcb"] }).notNull(),

  // STOCK sheet used GROUP + ITEM + DATA/TYPE. BLANK PCB used
  // PCB Number + Name. `code` and `name` cover both; `groupName` and
  // `subtype` are optional extra detail carried over from STOCK.
  code: text("code"), // PCB Number, or a short SKU for stock items
  name: text("name").notNull(),
  groupName: text("group_name"), // STOCK only, e.g. "BLUETOOTH", "DP FND"
  subtype: text("subtype"), // STOCK only, e.g. "105 DEGREE"

  price: real("price").notNull().default(0),
  minQty: integer("min_qty").notNull().default(0),
  remarks: text("remarks"),
  isDeleted: text("is_deleted", { enum: ["yes", "no"] }).notNull().default("no"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Every stock change is one row here. Current stock for an item is
// always SUM(in) - SUM(out) over its movements — never stored,
// so it can't drift out of sync the way the old spreadsheet's
// duplicated columns could.
export const movements = sqliteTable("movements", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  direction: text("direction", { enum: ["in", "out"] }).notNull(),
  qty: integer("qty").notNull(),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const authUsers = sqliteTable("auth_users", {
  username: text("username", { enum: ["admin", "impax"] }).primaryKey(),
  passwordHash: text("password_hash").notNull(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Movement = typeof movements.$inferSelect;
export type NewMovement = typeof movements.$inferInsert;
