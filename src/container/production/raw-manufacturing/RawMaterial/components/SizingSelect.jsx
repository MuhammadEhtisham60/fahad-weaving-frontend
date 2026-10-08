import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  Check,
  Search,
  Building2,
  X,
  Factory,
} from "lucide-react";

export function SizingSelect({
  value,
  onChange,
  sizings = [],
  onOpenAddModal,
  placeholder = "Select Target Sizing Unit",
  className = "",
  error,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const normalizedSizings = (Array.isArray(sizings) ? sizings : []).map((s) => {
    if (typeof s === "string") return { id: s, name: s, label: s, value: s };
    const name =
      s.sizingName ||
      s.name ||
      s.label ||
      s.companyName ||
      (s.id !== undefined || s.value !== undefined ? `Sizing Unit #${s.id ?? s.value}` : "Sizing Unit");
    const val = s.id !== undefined ? s.id : s.value !== undefined ? s.value : name;
    return {
      id: val,
      name,
      label: name,
      value: val,
      contactPerson: s.contactPerson,
      phoneNo: s.phoneNo || s.contactNumber,
      raw: s,
    };
  });

  const filteredSizings = normalizedSizings.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const displayLabel = (() => {
    if (!value && value !== 0) return "";
    const match = normalizedSizings.find(
      (s) => String(s.value) === String(value) || String(s.id) === String(value) || s.name === value
    );
    return match ? match.name : (typeof value === "string" ? value : `Sizing Unit #${value}`);
  })();

  const handleSelect = (sizingItem) => {
    onChange(sizingItem.value !== undefined ? sizingItem.value : sizingItem.id, sizingItem);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    setSearchQuery("");
    if (onOpenAddModal) {
      onOpenAddModal();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full h-11 px-3.5 rounded-xl bg-muted border ${
          error
            ? "border-destructive focus:border-destructive"
            : isOpen
            ? "border-primary ring-2 ring-primary/20 bg-background"
            : "border-border/60 hover:border-border"
        } flex items-center justify-between gap-2 text-sm text-left transition-smooth cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Factory
            className={`h-4 w-4 shrink-0 ${
              value ? "text-primary" : "text-muted-foreground"
            }`}
          />
          {displayLabel ? (
            <span className="font-semibold text-foreground truncate">
              {displayLabel}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      {/* Custom Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Top Search Input */}
          <div className="p-2 border-b border-border bg-muted/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sizing units..."
                className="w-full h-8 pl-8 pr-7 rounded-lg bg-muted text-xs text-foreground placeholder:text-muted-foreground border border-transparent focus:border-ring focus:bg-background outline-none transition-smooth"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sizing Units List */}
          <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 scrollbar-custom">
            {filteredSizings.length > 0 ? (
              filteredSizings.map((unit) => {
                const isSelected =
                  String(value) === String(unit.value) ||
                  String(value) === String(unit.id) ||
                  value === unit.name;
                return (
                  <button
                    key={unit.id || unit.value || unit.name}
                    type="button"
                    onClick={() => handleSelect(unit)}
                    className={`w-full px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 text-left transition-smooth cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-foreground hover:bg-muted font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <div className="truncate">
                        <span className="truncate">{unit.name}</span>
                        {unit.contactPerson && (
                          <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                            ({unit.contactPerson})
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No matching sizing units found
              </div>
            )}
          </div>

          {/* Pinned Bottom "Add New Sizing Unit" Action Section */}
          <div className="p-2 border-t border-border bg-muted/40">
            <button
              type="button"
              onClick={handleAddClick}
              className="w-full h-9 px-3 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 hover:border-primary/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-smooth cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add New Sizing Unit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
