import React, { useState, useCallback, useRef } from "react";
import { ConfirmationModal } from "./ConfirmationModal.jsx";

/**
 * Hook to imperatively show confirmation dialogs anywhere in the application.
 *
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirm();
 *
 *   const handleDelete = async () => {
 *     const isConfirmed = await confirm({
 *       title: "Delete Record",
 *       message: "Are you sure you want to delete this record?",
 *       confirmText: "Delete",
 *       variant: "danger",
 *     });
 *     if (!isConfirmed) return;
 *     // perform deletion...
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleDelete}>Delete</button>
 *       <ConfirmDialog />
 *     </>
 *   );
 */
export function useConfirm() {
  const [dialogConfig, setDialogConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogConfig({
        title: options.title || "Confirm Action",
        message: options.message || options.description || "Are you sure you want to continue?",
        confirmText: options.confirmText,
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "danger",
        warningNote: options.warningNote || options.note,
        itemName: options.itemName,
        icon: options.icon,
        size: options.size || "md",
        onConfirmAction: options.onConfirmAction, // Optional async callback
      });
      setIsLoading(false);
    });
  }, []);

  const handleClose = useCallback(() => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    setDialogConfig(null);
    setIsLoading(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (dialogConfig?.onConfirmAction) {
      try {
        setIsLoading(true);
        await dialogConfig.onConfirmAction();
        if (resolverRef.current) {
          resolverRef.current(true);
          resolverRef.current = null;
        }
        setDialogConfig(null);
      } catch (err) {
        console.error("Error during confirm action:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (resolverRef.current) {
        resolverRef.current(true);
        resolverRef.current = null;
      }
      setDialogConfig(null);
    }
  }, [dialogConfig]);

  const ConfirmDialog = useCallback(() => {
    if (!dialogConfig) return null;
    return (
      <ConfirmationModal
        isOpen={Boolean(dialogConfig)}
        title={dialogConfig.title}
        message={dialogConfig.message}
        confirmText={dialogConfig.confirmText}
        cancelText={dialogConfig.cancelText}
        variant={dialogConfig.variant}
        warningNote={dialogConfig.warningNote}
        itemName={dialogConfig.itemName}
        icon={dialogConfig.icon}
        size={dialogConfig.size}
        isLoading={isLoading}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    );
  }, [dialogConfig, isLoading, handleClose, handleConfirm]);

  return {
    confirm,
    ConfirmDialog,
    isConfirmOpen: Boolean(dialogConfig),
  };
}
