import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";

export function DeleteConfirmModal({ title, message, itemName, onConfirm, onClose, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-foreground">{title || "Confirm Deletion"}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {message || "Are you sure you want to delete this item? This action cannot be undone."}
            </p>
            {itemName && (
              <div className="mt-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-sm font-semibold text-destructive font-mono break-all">
                {itemName}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? "Deleting..." : "Delete User"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
