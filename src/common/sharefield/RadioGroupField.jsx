import React, { forwardRef } from "react";
import { FieldWrapper } from "./FieldWrapper.jsx";

/**
 * Reusable Radio Group Field component.
 * Supports horizontal, vertical, and card layouts with descriptions.
 */
export const RadioGroupField = forwardRef(function RadioGroupField(
  {
    label,
    id,
    name,
    value,
    defaultValue,
    onChange,
    options = [],
    required = false,
    optional = false,
    disabled = false,
    error,
    helperText,
    hint,
    layout = "vertical", // "vertical", "horizontal", "grid"
    variant = "inline", // "inline" or "card"
    className = "",
    wrapperClassName = "",
    ...props
  },
  ref
) {
  const generatedId = id || (name ? `field-${name}` : undefined);

  const layoutClasses = {
    vertical: "flex flex-col gap-2",
    horizontal: "flex flex-wrap items-center gap-4",
    grid: "grid grid-cols-1 sm:grid-cols-2 gap-3",
  }[layout] || "flex flex-col gap-2";

  return (
    <FieldWrapper
      label={label}
      id={generatedId}
      required={required}
      optional={optional}
      error={error}
      helperText={helperText}
      hint={hint}
      className={wrapperClassName}
    >
      <div className={`${layoutClasses} ${className}`} role="radiogroup">
        {options.map((option, idx) => {
          const optVal = typeof option === "object" ? option.value : option;
          const optLabel = typeof option === "object" ? option.label : option;
          const optDesc = typeof option === "object" ? option.description : null;
          const optDisabled = disabled || (typeof option === "object" && option.disabled);
          const isSelected = value !== undefined ? value === optVal : defaultValue === optVal;
          const optionId = `${generatedId || "radio"}-${optVal}-${idx}`;

          if (variant === "card") {
            return (
              <label
                key={optVal || idx}
                htmlFor={optionId}
                className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
                    : "bg-muted/30 border-border hover:bg-muted/60"
                } ${optDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  ref={idx === 0 ? ref : undefined}
                  type="radio"
                  id={optionId}
                  name={name}
                  value={optVal}
                  checked={isSelected}
                  onChange={onChange}
                  disabled={optDisabled}
                  className="mt-0.5 h-4 w-4 accent-primary text-primary focus:ring-primary/20"
                  {...props}
                />
                <div className="flex-1 select-none">
                  <div className="text-xs font-bold text-foreground">{optLabel}</div>
                  {optDesc && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">{optDesc}</div>
                  )}
                </div>
              </label>
            );
          }

          // Inline style
          return (
            <label
              key={optVal || idx}
              htmlFor={optionId}
              className={`inline-flex items-center gap-2 cursor-pointer select-none ${
                optDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <input
                ref={idx === 0 ? ref : undefined}
                type="radio"
                id={optionId}
                name={name}
                value={optVal}
                checked={isSelected}
                onChange={onChange}
                disabled={optDisabled}
                className="h-4 w-4 accent-primary text-primary focus:ring-primary/20"
                {...props}
              />
              <span className="text-xs font-medium text-foreground">{optLabel}</span>
            </label>
          );
        })}
      </div>
    </FieldWrapper>
  );
});
