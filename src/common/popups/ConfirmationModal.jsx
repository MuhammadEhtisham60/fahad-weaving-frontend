import React, { useEffect, useCallback } from "react";
import {
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Info,
  X,
  Loader2,
} from "lucide-react";

/**
 * Reusable Confirmation & Alert Modal component.
 *
 * @param {Object} props
 * @param {boolean} [props.isOpen=true] - Control modal visibility.
 * @param {boolean} [props.open] - Alias for isOpen.
 * @param {Function} props.onClose - Triggered when modal is dismissed / cancelled.
 * @param {Function} [props.onCancel] - Alias for onClose.
 * @param {Function} props.onConfirm - Triggered when user confirms the action.
 * @param {string|React.ReactNode} [props.title="Confirm Action"] - Modal heading.
 * @param {string|React.ReactNode} [props.message] - Main confirmation body/text.
 * @param {string|React.ReactNode} [props.description] - Alias for message.
 * @param {string|React.ReactNode} [props.children] - Additional body content.
 * @param {string} [props.confirmText] - Label for confirmation button.
 * @param {string} [props.cancelText="Cancel"] - Label for cancel button.
 * @param {"danger"|"warning"|"info"|"success"|"primary"} [props.variant="danger"] - Visual color and icon theme.
 * @param {React.ElementType} [props.icon] - Custom Lucide Icon override.
 * @param {boolean} [props.isLoading=false] - Show spinner on confirm button and disable inputs.
 * @param {boolean} [props.isDeleting] - Alias for isLoading.
 * @param {string|React.ReactNode} [props.warningNote] - Optional warning banner inside modal.
 * @param {string} [props.itemName] - Optional string to emphasize in bold within message.
 * @param {boolean} [props.showCloseButton=true] - Display top right X button.
 * @param {"sm"|"md"|"lg"} [props.size="md"] - Modal width sizing.
 */
export function ConfirmationModal({
  isOpen = true,
  open,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  description,
  children,
  confirmText,
  cancelText = "Cancel",
  variant = "danger",
  icon: CustomIcon,
  isLoading = false,
  isDeleting,
  warningNote,
  itemName,
  showCloseButton = true,
  size = "md",
}) {
  const visible = open !== undefined ? open : isOpen;
  const loading = isDeleting !== undefined ? isDeleting : isLoading;
  const handleClose = onCancel || onClose;

  // Keydown ESC listener
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !loading && handleClose) {
        handleClose();
      }
    },
    [loading, handleClose]
  );

  useEffect(() => {
    if (visible) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  // Variant Styling & Icon Configurations
  const variantConfig = {
    danger: {
      defaultTitle: "Confirm Delete",
      defaultConfirmText: "Delete",
      defaultIcon: CustomIcon || Trash2 || AlertTriangle,
      iconContainer: "bg-destructive/10 text-destructive border-destructive/20",
      confirmButton:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    },
    warning: {
      defaultTitle: "Warning",
      defaultConfirmText: "Proceed",
      defaultIcon: CustomIcon || AlertCircle,
      iconContainer: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      confirmButton:
        "bg-amber-600 dark:bg-amber-500 text-white hover:opacity-90 shadow-sm",
    },
    info: {
      defaultTitle: "Confirmation",
      defaultConfirmText: "Confirm",
      defaultIcon: CustomIcon || Info || HelpCircle,
      iconContainer: "bg-info/10 text-info border-info/20",
      confirmButton: "bg-info text-info-foreground hover:bg-info/90 shadow-sm",
    },
    success: {
      defaultTitle: "Confirm Success Action",
      defaultConfirmText: "Confirm",
      defaultIcon: CustomIcon || CheckCircle2,
      iconContainer: "bg-success/10 text-success border-success/20",
      confirmButton:
        "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
    },
    primary: {
      defaultTitle: "Confirm Action",
      defaultConfirmText: "Confirm",
      defaultIcon: CustomIcon || CheckCircle2,
      iconContainer: "bg-primary/10 text-primary border-primary/20",
      confirmButton:
        "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90",
    },
  };

  const config = variantConfig[variant] || variantConfig.danger;
  const IconComponent = config.defaultIcon;
  const headerTitle = title || config.defaultTitle;
  const btnConfirmLabel = confirmText || config.defaultConfirmText;
  const bodyMessage = message || description;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }[size] || "max-w-md";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading && handleClose) {
          handleClose();
        }
      }}
    >
      <div
        className={`bg-card border border-border rounded-2xl shadow-2xl w-full ${sizeClasses} p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon and Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-11 w-11 rounded-xl border flex items-center justify-center shrink-0 ${config.iconContainer}`}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {headerTitle}
              </h3>
              <p className="text-xs text-muted-foreground">
                {variant === "danger"
                  ? "This action cannot be undone."
                  : "Please review and confirm to proceed."}
              </p>
            </div>
          </div>
          {showCloseButton && handleClose && (
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="space-y-3">
          {bodyMessage && (
            <div className="text-xs text-muted-foreground leading-relaxed">
              {typeof bodyMessage === "string" ? (
                <p>
                  {itemName ? (
                    <>
                      {bodyMessage.includes(itemName) ? (
                        bodyMessage
                      ) : (
                        <>
                          {bodyMessage}{" "}
                          <strong className="text-foreground font-semibold">
                            {itemName}
                          </strong>
                          ?
                        </>
                      )}
                    </>
                  ) : (
                    bodyMessage
                  )}
                </p>
              ) : (
                bodyMessage
              )}
            </div>
          )}

          {/* Optional Warning Note Banner */}
          {warningNote && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <div className="leading-relaxed">{warningNote}</div>
            </div>
          )}

          {/* Additional children slot */}
          {children}
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/50">
          {handleClose && (
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="h-9 px-4 rounded-lg border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
          )}
          <button
            type="button"
            onClick={async (e) => {
              if (onConfirm) {
                await onConfirm(e);
              }
            }}
            disabled={loading}
            className={`h-9 px-4 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 ${config.confirmButton}`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {btnConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Alias for semantic clarity
export const ConfirmModal = ConfirmationModal;
export const DeleteConfirmationModal = ConfirmationModal;
