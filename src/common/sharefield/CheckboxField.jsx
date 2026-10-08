import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Reusable Checkbox Field component.
 * Supports simple inline and card container variants with titles and descriptions.
 */
export const CheckboxField = forwardRef(function CheckboxField(
  {
    label,
    description,
    id,
    name,
    checked,
    defaultChecked,
    onChange,
    disabled = false,
    error,
    variant = "inline", // "inline" or "card"
    className = "",
    wrapperClassName = "",
    checkboxClassName = "",
    ...props
  },
  ref
) {
  const generatedId = id || (name ? `field-${name}` : undefined);

  if (variant === "card") {
    return (
      <div className={`w-full ${wrapperClassName}`}>
        <label
          htmlFor={generatedId}
          className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
            checked
              ? "bg-primary/5 border-primary/40 shadow-sm"
              : "bg-muted/40 border-border hover:bg-muted/60"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
          <input
            ref={ref}
            id={generatedId}
            name={name}
            type="checkbox"
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            disabled={disabled}
            className={`mt-0.5 h-4 w-4 rounded accent-primary text-primary focus:ring-primary/20 ${checkboxClassName}`}
            {...props}
          />
          <div className="flex-1 select-none">
            {label && (
              <div className="text-xs font-bold text-foreground leading-snug">
                {label}
              </div>
            )}
            {description && (
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-normal">
                {description}
              </div>
            )}
          </div>
        </label>

        {error && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-destructive mt-1.5 animate-in fade-in duration-150">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  // Simple inline variant
  return (
    <div className={`w-full ${wrapperClassName}`}>
      <label
        htmlFor={generatedId}
        className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        <input
          ref={ref}
          id={generatedId}
          name={name}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          disabled={disabled}
          className={`h-4 w-4 rounded accent-primary text-primary focus:ring-primary/20 ${checkboxClassName}`}
          {...props}
        />
        {label && <span className="text-xs font-semibold text-foreground">{label}</span>}
      </label>

      {description && (
        <p className="text-[11px] text-muted-foreground ml-6.5 mt-0.5">{description}</p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-destructive mt-1 animate-in fade-in duration-150">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});
