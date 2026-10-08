import React from "react";
import { ConfirmationModal } from "../../../common/popups/index.js";

export function CustomerDeleteModal({ customerName, onConfirm, onClose, isDeleting }) {
  return (
    <ConfirmationModal
      isOpen
      title="Delete Customer"
      message="Are you sure you want to delete"
      itemName={customerName}
      warningNote="All associated bank accounts will also be permanently deleted."
      confirmText="Delete Customer"
      variant="danger"
      isLoading={isDeleting}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
