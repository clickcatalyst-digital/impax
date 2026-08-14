"use client";

import { useState, useTransition } from "react";
import { ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { recordMovementAction } from "@/app/actions";

export function RecordMovementDialog({
  itemId,
  itemName,
  currentStock,
}: {
  itemId: number;
  itemName: string;
  currentStock: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await recordMovementAction(formData);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Record movement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{itemName}</DialogTitle>
          <DialogDescription>Current stock: {currentStock} units</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="itemId" value={itemId} />

          <div className="space-y-1">
            <Label htmlFor="direction">Direction</Label>
            <Select id="direction" name="direction" defaultValue="in">
              <option value="in">Stock in (received)</option>
              <option value="out">Stock out (used / issued)</option>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="qty">Quantity</Label>
            <Input id="qty" name="qty" type="number" min="1" required autoFocus />
          </div>

          <div className="space-y-1">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" name="note" placeholder="e.g. purchase order #, job name" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? (
                "Saving..."
              ) : (
                <>
                  <ArrowDownToLine className="mr-1.5 h-4 w-4" />
                  Save movement
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
