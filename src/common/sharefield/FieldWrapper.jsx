import React from "react";
import { AlertCircle, HelpCircle } from "lucide-react";

/**
 * Standardized field wrapper handling labels, required asterisks, helper text, and validation errors.
 */
export function FieldWrapper({
  label,
  id,
  required = false,
  optional = false,
  hint,
  error,
  helperText,
  className = "",
  children,
}) {
  return (
    <div className={`space-y-1 w-full ${className}`}>
      {/* Label Row */}
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor={id}
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 select-none"
          >
            <span>{label}</span>
            {required && <span className="text-destructive font-bold">*</span>}
            {optional && !required && (
              <span className="text-[10px] lowercase font-normal text-muted-foreground/70">
                (optional)
              </span>
            )}
          </label>

          {hint && (
            <div className="group relative flex items-center text-muted-foreground hover:text-foreground cursor-help">
              <HelpCircle className="h-3.5 w-3.5" />
              <div className="absolute right-0 bottom-full mb-1.5 hidden group-hover:block z-30 w-48 p-2 rounded-lg bg-popover text-popover-foreground text-[11px] shadow-lg border border-border">
                {hint}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Element */}
      {children}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-destructive mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{Array.isArray(error) ? error[0] : error}</span>
        </div>
      )}

      {/* Helper Text (only displayed when there is no error) */}
      {!error && helperText && (
        <p className="text-[11px] text-muted-foreground mt-1">{helperText}</p>
      )}
    </div>
  );
}
