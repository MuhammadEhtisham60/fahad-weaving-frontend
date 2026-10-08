import React, { forwardRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

/**
 * Reusable Search Input Field component with instant clear button and loading indicator.
 */
export const SearchField = forwardRef(function SearchField(
  {
    value,
    defaultValue,
    onChange,
    onClear,
    placeholder = "Search records...",
    isLoading = false,
    size = "md",
    className = "",
    wrapperClassName = "",
    inputClassName = "",
    shortcutKey,
    disabled = false,
    ...props
  },
  ref
) {
  const sizeClasses = {
    sm: "h-8 text-xs pl-8 pr-8 rounded-md",
    md: "h-10 text-xs pl-9 pr-9 rounded-lg",
    lg: "h-12 text-sm pl-10 pr-10 rounded-lg",
  }[size] || "h-10 text-xs pl-9 pr-9 rounded-lg";

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size] || "h-4 w-4";

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: "" } });
    }
  };

  const hasValue = Boolean(value);

  return (
    <div className={`relative flex items-center w-full ${wrapperClassName}`}>
      {/* Search Icon or Loading Spinner */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center">
        {isLoading ? (
          <Loader2 className={`${iconSizes} animate-spin text-primary`} />
        ) : (
          <Search className={`${iconSizes}`} />
        )}
      </div>

      {/* Input */}
      <input
        ref={ref}
        type="text"
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-muted border border-transparent font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:bg-background focus:border-ring focus:ring-1 focus:ring-ring ${sizeClasses} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${inputClassName} ${className}`}
        {...props}
      />

      {/* Clear Button */}
      {hasValue && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          tabIndex={-1}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors"
          title="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Shortcut Indicator (when empty) */}
      {!hasValue && shortcutKey && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-muted/60 text-muted-foreground pointer-events-none">
          {shortcutKey}
        </span>
      )}
    </div>
  );
});
