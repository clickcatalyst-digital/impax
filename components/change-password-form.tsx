"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { changePasswordAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await changePasswordAction(formData);
      if (result.error) setMessage({ type: "error", text: result.error });
      if (result.success) setMessage({ type: "success", text: result.success });
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" name="currentPassword" type={showPasswords ? "text" : "password"} autoComplete="current-password" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nextPassword">New password</Label>
        <Input id="nextPassword" name="nextPassword" type={showPasswords ? "text" : "password"} autoComplete="new-password" minLength={6} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <div className="relative">
          <Input id="confirmPassword" name="confirmPassword" type={showPasswords ? "text" : "password"} autoComplete="new-password" minLength={6} required className="pr-10" />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setShowPasswords((value) => !value)}
            aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {message && (
        <p className={message.type === "error" ? "rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive" : "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"}>
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
