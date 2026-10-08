import React, { useState, forwardRef } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { FieldWrapper } from "./FieldWrapper.jsx";

/**
 * Reusable Password Field component with toggleable password visibility.
 */
export const PasswordField = forwardRef(function PasswordField(
  {
    label = "Password",
    id,
    name = "password",
    value,
    defaultValue,
    onChange,
    placeholder = "••••••••",
    required = false,
    optional = false,
    disabled = false,
    readOnly = false,
    error,
    helperText,
    hint,
    icon: Icon = Lock,
    showToggle = true,
    size = "md",
    className = "",
    wrapperClassName = "",
    inputClassName = "",
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = id || (name ? `field-${name}` : "field-password");

  const sizeClasses = {
    sm: "h-8 text-xs pl-8 pr-8 rounded-md",
    md: "h-10 text-xs pl-9 pr-9 rounded-lg",
    lg: "h-12 text-sm pl-10 pr-10 rounded-lg",
  }[size] || "h-10 text-xs pl-9 pr-9 rounded-lg";

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
        {/* Left Lock Icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center">
            {typeof Icon === "function" || typeof Icon === "object" ? (
              <Icon className="h-4 w-4" />
            ) : (
              Icon
            )}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={generatedId}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full bg-muted border font-mono text-foreground outline-none transition-all placeholder:text-muted-foreground/60 ${sizeClasses} ${
            error
              ? "border-destructive bg-destructive/5 focus:border-destructive focus:ring-1 focus:ring-destructive"
              : "border-transparent focus:bg-background focus:border-ring focus:ring-1 focus:ring-ring"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-muted/40" : ""} ${inputClassName} ${className}`}
          {...props}
        />

        {/* Visibility Toggle Button */}
        {showToggle && !disabled && !readOnly && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </FieldWrapper>
  );
});
