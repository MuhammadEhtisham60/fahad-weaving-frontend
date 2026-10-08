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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{title}</h3>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 sm:mt-6 flex items-center justify-end gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            type="button"
            className="text-xs sm:text-sm py-2 px-3.5 flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            type="button"
            className="text-xs sm:text-sm py-2 px-4 flex-1 sm:flex-initial"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" /> Deleting...
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
