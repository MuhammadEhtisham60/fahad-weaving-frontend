import React, { forwardRef } from "react";
import { FieldWrapper } from "./FieldWrapper.jsx";

/**
 * Reusable Multiline Textarea Field component.
 * Supports character count, auto-resize hint, and custom rows.
 */
export const TextareaField = forwardRef(function TextareaField(
  {
    label,
    id,
    name,
    value,
    defaultValue,
    onChange,
    placeholder,
    rows = 3,
    maxLength,
    showCount = false,
    required = false,
    optional = false,
    disabled = false,
    readOnly = false,
    error,
    helperText,
    hint,
    className = "",
    wrapperClassName = "",
    textareaClassName = "",
    ...props
  },
  ref
) {
  const generatedId = id || (name ? `field-${name}` : undefined);
  const currentLength = typeof value === "string" ? value.length : 0;

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
      <div className="relative w-full">
        <textarea
          ref={ref}
          id={generatedId}
          name={name}
          rows={rows}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full p-3 rounded-lg bg-muted border font-medium text-xs text-foreground outline-none transition-all placeholder:text-muted-foreground/60 resize-y ${
            error
              ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-1 focus:ring-destructive"
              : "border-transparent focus:bg-background focus:border-ring focus:ring-1 focus:ring-ring"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-muted/40" : ""} ${textareaClassName} ${className}`}
          {...props}
        />

        {/* Character count */}
        {showCount && maxLength && (
          <div className="text-[10px] text-muted-foreground font-mono text-right mt-1">
            {currentLength} / {maxLength}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
});
