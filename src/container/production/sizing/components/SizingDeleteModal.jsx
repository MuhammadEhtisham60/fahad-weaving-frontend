import React from "react";
import { ConfirmationModal } from "../../../../common/popups/index.js";

export function SizingDeleteModal({ sizingName, onConfirm, onClose, isDeleting }) {
  return (
    <ConfirmationModal
      isOpen
      title="Delete Sizing Unit"
      message="Are you sure you want to delete sizing unit"
      itemName={sizingName || "this entry"}
      warningNote="Note: Deletion will be rejected if there are existing sizing outcomes referencing this unit to protect historical records."
      confirmText="Delete Unit"
      variant="danger"
      isLoading={isDeleting}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
