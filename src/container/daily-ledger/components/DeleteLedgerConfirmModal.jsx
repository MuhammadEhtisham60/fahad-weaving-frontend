import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";

export function DeleteLedgerConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Delete Record",
  description = "Are you sure you want to delete this record? This action cannot be undone and will automatically recalculate balances.",
  isDeleting = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            type="button"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
