import React from "react";
import { ConfirmationModal } from "../../../../common/popups/index.js";

export function LoomDeleteModal({ loomCode, loomName, onConfirm, onClose, isDeleting }) {
  const displayLabel = loomName ? `${loomCode} (${loomName})` : loomCode;
  return (
    <ConfirmationModal
      isOpen
      title="Delete Loom"
      message="Are you sure you want to delete loom"
      itemName={displayLabel}
      confirmText="Delete Loom"
      variant="danger"
      isLoading={isDeleting}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
