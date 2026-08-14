"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createItemAction } from "@/app/actions";

export function AddItemDialog({ category }: { category: "stock" | "pcb" }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createItemAction(formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {category === "stock" ? "stock" : "PCB"} item</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="category" value={category} />

          <div className="space-y-1">
            <Label htmlFor="name">{category === "pcb" ? "Name" : "Item"}</Label>
            <Input id="name" name="name" required placeholder="e.g. HC 05" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="code">{category === "pcb" ? "PCB number" : "Code (optional)"}</Label>
            <Input id="code" name="code" placeholder={category === "pcb" ? "e.g. 7236" : "optional"} />
          </div>

          {category === "stock" && (
            <>
              <div className="space-y-1">
                <Label htmlFor="groupName">Group</Label>
                <Input id="groupName" name="groupName" placeholder="e.g. BLUETOOTH" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="subtype">Subtype / detail</Label>
                <Input id="subtype" name="subtype" placeholder="e.g. 105 DEGREE" />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="price">Unit price</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue="0" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minQty">Min quantity</Label>
              <Input id="minQty" name="minQty" type="number" min="0" defaultValue="0" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="remarks">Remarks (optional)</Label>
            <Input id="remarks" name="remarks" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
