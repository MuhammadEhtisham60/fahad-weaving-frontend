import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Reusable Toggle Switch Field component with smooth sliding indicator.
 */
export const SwitchField = forwardRef(function SwitchField(
  {
    label,
    description,
    id,
    name,
    checked = false,
    onChange,
    disabled = false,
    error,
    size = "md",
    className = "",
    wrapperClassName = "",
    ...props
  },
  ref
) {
  const generatedId = id || (name ? `field-${name}` : undefined);

  const toggleSizes = {
    sm: { switch: "w-8 h-4", thumb: "h-3 w-3", translate: "translate-x-4" },
    md: { switch: "w-11 h-6", thumb: "h-5 w-5", translate: "translate-x-5" },
    lg: { switch: "w-14 h-7", thumb: "h-6 w-6", translate: "translate-x-7" },
  }[size] || { switch: "w-11 h-6", thumb: "h-5 w-5", translate: "translate-x-5" };

  const handleToggle = () => {
    if (disabled) return;
    if (onChange) {
      onChange({ target: { name, checked: !checked, type: "checkbox" } });
    }
  };

  return (
    <div className={`w-full ${wrapperClassName}`}>
      <div className={`flex items-center justify-between gap-3 ${className}`}>
        {(label || description) && (
          <div className="flex-1 select-none pr-2">
            {label && (
              <label
                htmlFor={generatedId}
                onClick={handleToggle}
                className={`text-xs font-bold text-foreground cursor-pointer block ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
                {description}
              </p>
            )}
          </div>
        )}

        <button
          ref={ref}
          type="button"
          role="switch"
          id={generatedId}
          name={name}
          aria-checked={checked}
          disabled={disabled}
          onClick={handleToggle}
          className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            toggleSizes.switch
          } ${
            checked
              ? "bg-primary"
              : "bg-muted-foreground/20 hover:bg-muted-foreground/30"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          {...props}
        >
          <span
            className={`inline-block rounded-full bg-white shadow-md transform transition-transform duration-200 pointer-events-none ${
              toggleSizes.thumb
            } ${checked ? `${toggleSizes.translate}` : "translate-x-0.5"}`}
          />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-destructive mt-1.5 animate-in fade-in duration-150">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});
