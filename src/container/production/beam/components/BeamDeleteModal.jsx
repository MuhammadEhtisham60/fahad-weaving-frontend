import React from "react";
import { ConfirmationModal } from "../../../../common/popups/index.js";

export function BeamDeleteModal({ beamNumber, onConfirm, onClose, isDeleting }) {
  return (
    <ConfirmationModal
      isOpen
      title="Delete Beam"
      message="Are you sure you want to delete beam"
      itemName={beamNumber}
      confirmText="Delete Beam"
      variant="danger"
      isLoading={isDeleting}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
