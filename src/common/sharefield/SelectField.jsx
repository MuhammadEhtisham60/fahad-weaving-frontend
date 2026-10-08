import React, { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { FieldWrapper } from "./FieldWrapper.jsx";

/**
 * Modern Custom Select Dropdown Field component.
 * Replaces native OS dropdowns with a sleek, styled popover menu.
 * Fully compatible with standard form onChange events: e.target.value
 */
export const SelectField = forwardRef(function SelectField(
  {
    label,
    id,
    name,
    value,
    defaultValue,
    onChange,
    options = [],
    placeholder = "Select an option...",
    required = false,
    optional = false,
    disabled = false,
    error,
    helperText,
    hint,
    icon: Icon,
    size = "md",
    className = "",
    wrapperClassName = "",
    selectClassName = "",
    searchable = true,
    children,
    ...props
  },
  ref
) {
  const generatedId = id || (name ? `field-${name}` : undefined);
  const containerRef = useRef(null);

  // Internal state for open/close & search
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Normalize options list into array of { value, label, disabled }
  const parsedOptions = React.useMemo(() => {
    if (children) {
      const opts = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === "option") {
          opts.push({
            value: child.props.value !== undefined ? child.props.value : child.props.children,
            label: child.props.children,
            disabled: child.props.disabled,
          });
        }
      });
      return opts;
    }

    return options.map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        const val = opt.value !== undefined ? opt.value : opt.id || opt.name;
        const lbl = opt.label || opt.name || String(val);
        return { value: val, label: lbl, disabled: Boolean(opt.disabled) };
      }
      return { value: opt, label: String(opt), disabled: false };
    });
  }, [options, children]);

  // Current selected option object
  const selectedOption = parsedOptions.find((opt) => String(opt.value) === String(value));

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Filtered options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return parsedOptions;
    const q = searchQuery.toLowerCase();
    return parsedOptions.filter(
      (opt) =>
        String(opt.label).toLowerCase().includes(q) ||
        String(opt.value).toLowerCase().includes(q)
    );
  }, [parsedOptions, searchQuery]);

  const handleSelectOption = (opt) => {
    if (opt.disabled) return;
    setIsOpen(false);
    setSearchQuery("");

    if (onChange) {
      const syntheticEvent = {
        target: {
          name,
          id: generatedId,
          value: opt.value,
        },
      };
      onChange(syntheticEvent);
    }
  };

  const handleClearSelection = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({
        target: { name, id: generatedId, value: "" },
      });
    }
  };

  // Height and font sizing
  const sizeClasses =
    {
      sm: "h-8 text-xs px-2.5 rounded-md",
      md: "h-10 text-xs px-3 rounded-lg",
      lg: "h-12 text-sm px-3.5 rounded-lg",
    }[size] || "h-10 text-xs px-3 rounded-lg";

  const leftPaddingClass = Icon ? "pl-9" : "";

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
      <div ref={containerRef} className="relative w-full">
        {/* Hidden input for native form compatibility */}
        <input
          ref={ref}
          type="hidden"
          id={generatedId}
          name={name}
          value={value || ""}
          {...props}
        />

        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full bg-muted border font-semibold text-foreground text-left outline-none transition-all flex items-center justify-between gap-2 cursor-pointer ${sizeClasses} ${leftPaddingClass} ${
            error
              ? "border-destructive bg-destructive/5 focus:ring-1 focus:ring-destructive"
              : isOpen
              ? "border-primary ring-2 ring-primary/20 bg-background"
              : "border-transparent hover:bg-muted/80 focus:bg-background focus:border-ring"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-muted/40" : ""} ${selectClassName} ${className}`}
        >
          {/* Left Icon */}
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center justify-center">
              {typeof Icon === "function" || typeof Icon === "object" ? (
                <Icon className="h-4 w-4" />
              ) : (
                Icon
              )}
            </div>
          )}

          {/* Display Label / Placeholder */}
          <span className={`truncate flex-1 ${!selectedOption ? "text-muted-foreground/70 font-normal" : ""}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 text-muted-foreground shrink-0">
            {value && !required && !disabled && (
              <span
                role="button"
                onClick={handleClearSelection}
                className="p-0.5 rounded hover:text-foreground hover:bg-muted-foreground/10 transition-colors"
                title="Clear selection"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-primary" : "opacity-70"
              }`}
            />
          </div>
        </button>

        {/* Dropdown Menu Popover */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-lg bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 flex flex-col max-h-72">
            {/* Search Input Filter (for lists with > 5 items or when searchable) */}
            {searchable && parsedOptions.length > 5 && (
              <div className="p-2 border-b border-border bg-muted/30">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full h-8 pl-8 pr-3 rounded-lg bg-background border border-border text-xs font-medium text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/60"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 text-muted-foreground hover:text-foreground p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="overflow-y-auto p-1.5 scrollbar-custom space-y-0.5 max-h-60">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No matching options found.
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-foreground hover:bg-muted/70 active:bg-muted"
                      } ${opt.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
});
