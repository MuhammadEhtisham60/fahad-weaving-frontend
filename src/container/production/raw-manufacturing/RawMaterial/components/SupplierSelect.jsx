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

export function SupplierSelect({
  value,
  onChange,
  suppliers = [],
  onAddSupplier,
  onOpenAddSupplierModal,
  placeholder = "Select Supplier / Spinning Mill",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [error, setError] = useState("");

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const addInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsAdding(false);
        setSearchQuery("");
        setError("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search or add input when opened
  useEffect(() => {
    if (isOpen) {
      if (isAdding && addInputRef.current) {
        addInputRef.current.focus();
      } else if (!isAdding && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [isOpen, isAdding]);

  const normalizedSuppliers = suppliers.map((s) => {
    if (typeof s === "string") return { id: s, name: s, label: s, value: s };
    const name = s.supplierName || s.name || s.label || s.companyName || `Supplier #${s.id || s.value}`;
    const val = s.id !== undefined ? s.id : s.value !== undefined ? s.value : name;
    return { id: val, name, label: name, value: val, raw: s };
  });

  const filteredSuppliers = normalizedSuppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const displayLabel = (() => {
    if (!value) return "";
    if (typeof value === "string") {
      const match = normalizedSuppliers.find((s) => String(s.value) === String(value) || s.name === value);
      return match ? match.name : value;
    }
    const match = normalizedSuppliers.find((s) => s.value === value || s.id === value);
    return match ? match.name : `Supplier #${value}`;
  })();

  const handleSelect = (supplierItem) => {
    onChange(supplierItem.value !== undefined ? supplierItem.value : supplierItem.name, supplierItem);
    setIsOpen(false);
    setSearchQuery("");
    setIsAdding(false);
    setError("");
  };

  const handleCreateSupplier = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const trimmed = newSupplierName.trim();
    if (!trimmed) {
      setError("Please enter supplier or mill name");
      return;
    }

    if (onAddSupplier) {
      onAddSupplier(trimmed);
    }
    onChange(trimmed);
    setNewSupplierName("");
    setError("");
    setIsAdding(false);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setIsAdding(false);
          setError("");
        }}
        className={`w-full h-11 px-3.5 rounded-xl bg-muted border ${
          isOpen ? "border-primary ring-2 ring-primary/20 bg-background" : "border-border/60 hover:border-border"
        } flex items-center justify-between gap-2 text-sm text-left transition-smooth cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Factory className={`h-4 w-4 shrink-0 ${value ? "text-primary" : "text-muted-foreground"}`} />
          {displayLabel ? (
            <span className="font-semibold text-foreground truncate">{displayLabel}</span>
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
                placeholder="Search spinning mills..."
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

          {/* Supplier Options List */}
          <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 scrollbar-custom">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map((supItem) => {
                const isSelected = String(value) === String(supItem.value) || String(value) === String(supItem.id) || value === supItem.name;
                return (
                  <button
                    key={supItem.id || supItem.value || supItem.name}
                    type="button"
                    onClick={() => handleSelect(supItem)}
                    className={`w-full px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 text-left transition-smooth cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-foreground hover:bg-muted font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="truncate">{supItem.name}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">
                No matching suppliers found
              </div>
            )}
          </div>

          {/* Pinned Bottom "Add New Supplier" Action Section */}
          <div className="p-2 border-t border-border bg-muted/40">
            {isAdding ? (
              <form onSubmit={handleCreateSupplier} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
                  <span>Add New Spinning Mill</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdding(false);
                      setError("");
                      setNewSupplierName("");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    ref={addInputRef}
                    type="text"
                    value={newSupplierName}
                    onChange={(e) => {
                      setNewSupplierName(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter spinning mill name..."
                    className="flex-1 h-8 px-2.5 rounded-lg bg-background border border-border focus:border-primary text-xs outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-smooth shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Save
                  </button>
                </div>

                {error && (
                  <p className="text-[11px] text-destructive font-medium">{error}</p>
                )}
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onOpenAddSupplierModal) {
                    setIsOpen(false);
                    onOpenAddSupplierModal();
                  } else {
                    setIsAdding(true);
                    if (searchQuery.trim() && !suppliers.includes(searchQuery.trim())) {
                      setNewSupplierName(searchQuery.trim());
                    }
                  }
                }}
                className="w-full h-9 px-3 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 hover:border-primary/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-smooth cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add New Supplier / Spinning Mill
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
