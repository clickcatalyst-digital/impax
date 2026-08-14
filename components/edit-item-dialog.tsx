"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteItemAction, updateItemAction } from "@/app/actions";
import type { ItemWithStock } from "@/lib/db/queries";

export function EditItemDialog({
  item,
  category,
}: {
  item: ItemWithStock;
  category: "stock" | "pcb";
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await updateItemAction(formData);
      setOpen(false);
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      `Archive “${item.name}”? It will be hidden from inventory, but its movement history will be preserved.`
    );
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", String(item.id));
    startTransition(async () => {
      await deleteItemAction(formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" aria-label={`Edit ${item.name}`} title="Edit item">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {category === "pcb" ? "PCB" : "stock item"}</DialogTitle>
          <DialogDescription>Update item details. Stock changes belong in Record movement.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="category" value={category} />

          <div className="space-y-1">
            <Label htmlFor={`edit-name-${item.id}`}>{category === "pcb" ? "Name" : "Item"}</Label>
            <Input id={`edit-name-${item.id}`} name="name" required defaultValue={item.name} />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`edit-code-${item.id}`}>{category === "pcb" ? "PCB number" : "Code (optional)"}</Label>
            <Input id={`edit-code-${item.id}`} name="code" defaultValue={item.code || ""} />
          </div>

          {category === "stock" && (
            <>
              <div className="space-y-1">
                <Label htmlFor={`edit-group-${item.id}`}>Group</Label>
                <Input id={`edit-group-${item.id}`} name="groupName" defaultValue={item.groupName || ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`edit-subtype-${item.id}`}>Subtype / detail</Label>
                <Input id={`edit-subtype-${item.id}`} name="subtype" defaultValue={item.subtype || ""} />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor={`edit-price-${item.id}`}>Unit price</Label>
              <Input id={`edit-price-${item.id}`} name="price" type="number" step="0.01" min="0" defaultValue={item.price} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`edit-min-${item.id}`}>Min quantity</Label>
              <Input id={`edit-min-${item.id}`} name="minQty" type="number" min="0" defaultValue={item.minQty} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor={`edit-remarks-${item.id}`}>Remarks (optional)</Label>
            <Input id={`edit-remarks-${item.id}`} name="remarks" defaultValue={item.remarks || ""} />
          </div>

          <DialogFooter className="items-center justify-between sm:justify-between">
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={pending}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Archive item
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
