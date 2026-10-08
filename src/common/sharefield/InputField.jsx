import React, { forwardRef } from "react";
import { X } from "lucide-react";
import { FieldWrapper } from "./FieldWrapper.jsx";

/**
 * Reusable text, number, email, phone, date Input Field component.
 * Fully configurable through props.
 */
export const InputField = forwardRef(function InputField(
  {
    label,
    id,
    name,
    type = "text",
    value,
    defaultValue,
    onChange,
    onClear,
    placeholder,
    required = false,
    optional = false,
    disabled = false,
    readOnly = false,
    autoFocus = false,
    error,
    helperText,
    hint,
    icon: Icon,
    rightIcon: RightIcon,
    prefix,
    suffix,
    clearable = false,
    size = "md",
    className = "",
    wrapperClassName = "",
    inputClassName = "",
    ...props
  },
  ref
) {
  const generatedId = id || (name ? `field-${name}` : undefined);

  // Height and font sizing
  const sizeClasses = {
    sm: "h-8 text-xs px-2.5 rounded-md",
    md: "h-10 text-xs px-3 rounded-lg",
    lg: "h-12 text-sm px-3.5 rounded-lg",
  }[size] || "h-10 text-xs px-3 rounded-lg";

  const hasLeftElement = Boolean(Icon || prefix);
  const hasRightElement = Boolean(RightIcon || suffix || (clearable && value));

  const leftPaddingClass = prefix ? "pl-7" : Icon ? "pl-9" : "";
  const rightPaddingClass = suffix ? "pr-8" : RightIcon ? "pr-9" : clearable && value ? "pr-8" : "";

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
      <div className="relative flex items-center w-full">
        {/* Left Icon or Prefix */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center">
            {typeof Icon === "function" || typeof Icon === "object" ? (
              <Icon className="h-4 w-4" />
            ) : (
              Icon
            )}
          </div>
        )}

        {prefix && !Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono font-bold select-none pointer-events-none">
            {prefix}
          </span>
        )}

        {/* Core Input */}
        <input
          ref={ref}
          id={generatedId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          className={`w-full bg-muted border font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 ${sizeClasses} ${leftPaddingClass} ${rightPaddingClass} ${
            error
              ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-1 focus:ring-destructive"
              : "border-transparent focus:bg-background focus:border-ring focus:ring-1 focus:ring-ring"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-muted/40" : ""} ${inputClassName} ${className}`}
          {...props}
        />

        {/* Clearable button */}
        {clearable && value && !disabled && !readOnly && (
          <button
            type="button"
            onClick={onClear || (() => onChange && onChange({ target: { name, value: "" } }))}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors"
            title="Clear input"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Right Icon or Suffix */}
        {RightIcon && !(clearable && value) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center">
            {typeof RightIcon === "function" || typeof RightIcon === "object" ? (
              <RightIcon className="h-4 w-4" />
            ) : (
              RightIcon
            )}
          </div>
        )}

        {suffix && !RightIcon && !(clearable && value) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px] font-semibold select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </FieldWrapper>
  );
});
