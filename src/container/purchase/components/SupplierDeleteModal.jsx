import React from "react";
import { ConfirmationModal } from "../../../common/popups/index.js";

export function SupplierDeleteModal({ supplierName, onConfirm, onClose, isDeleting }) {
  return (
    <ConfirmationModal
      isOpen
      title="Delete Supplier"
      message="Are you sure you want to delete"
      itemName={supplierName}
      warningNote="All associated bank accounts will also be permanently deleted."
      confirmText="Delete Supplier"
      variant="danger"
      isLoading={isDeleting}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
