"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authenticate, clearAuthSession, createAuthSession, requireUser } from "@/lib/auth";
import { addItem, deleteItem, recordMovement, updateItem } from "@/lib/db/queries";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const user = authenticate(username, password);

  if (!user) return { error: "Incorrect username or password." };

  await createAuthSession(user);
  redirect("/");
}

export async function logoutAction() {
  await clearAuthSession();
  redirect("/login");
}

export async function createItemAction(formData: FormData) {
  await requireUser();
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
  await requireUser();
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
  await requireUser();
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
  await requireUser();
  await deleteItem(Number(formData.get("id")));

  revalidatePath("/");
  revalidatePath("/stock");
  revalidatePath("/pcb");
}
