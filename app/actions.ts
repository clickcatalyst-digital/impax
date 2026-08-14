"use server";

import { revalidatePath } from "next/cache";
import { addItem, deleteItem, recordMovement, updateItem } from "@/lib/db/queries";

export async function createItemAction(formData: FormData) {
  const category = formData.get("category") as "stock" | "pcb";

  await addItem({
    category,
    code: (formData.get("code") as string) || null,
    name: formData.get("name") as string,
    groupName: (formData.get("groupName") as string) || null,
    subtype: (formData.get("subtype") as string) || null,
    price: Number(formData.get("price") || 0),
    minQty: Number(formData.get("minQty") || 0),
    remarks: (formData.get("remarks") as string) || null,
  });

  revalidatePath("/");
  revalidatePath("/stock");
  revalidatePath("/pcb");
}

export async function recordMovementAction(formData: FormData) {
  const itemId = Number(formData.get("itemId"));
  const direction = formData.get("direction") as "in" | "out";
  const qty = Number(formData.get("qty"));
  const note = (formData.get("note") as string) || null;

  await recordMovement({ itemId, direction, qty, note });

  revalidatePath("/");
  revalidatePath("/stock");
  revalidatePath("/pcb");
}

export async function updateItemAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const category = formData.get("category") as "stock" | "pcb";

  await updateItem(id, {
    code: (formData.get("code") as string) || null,
    name: formData.get("name") as string,
    groupName: category === "stock" ? (formData.get("groupName") as string) || null : null,
    subtype: category === "stock" ? (formData.get("subtype") as string) || null : null,
    price: Number(formData.get("price") || 0),
    minQty: Number(formData.get("minQty") || 0),
    remarks: (formData.get("remarks") as string) || null,
  });

  revalidatePath("/");
  revalidatePath("/stock");
  revalidatePath("/pcb");
}

export async function deleteItemAction(formData: FormData) {
  await deleteItem(Number(formData.get("id")));

  revalidatePath("/");
  revalidatePath("/stock");
  revalidatePath("/pcb");
}
