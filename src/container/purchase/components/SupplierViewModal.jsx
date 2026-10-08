import React from "react";
import { X, Building, Phone, Mail, User, CreditCard, ShieldCheck, MapPin, Calendar, Hash, Loader2 } from "lucide-react";
import { useGetSupplierByIdQuery } from "../../../store/index.js";
import { StatusBadge } from "../../../components/ui-kit.jsx";

export function SupplierViewModal({ supplierId, onClose }) {
  const { data: supplier, isLoading, isError } = useGetSupplierByIdQuery(supplierId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {supplier?.supplierName || "Supplier Details"}
                </h2>
                {supplier?.supplierCode && (
                  <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono text-muted-foreground font-semibold">
                    {supplier.supplierCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {supplier?.companyName || "Vendor profile & bank accounts"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-custom">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="text-xs font-semibold">Fetching supplier details...</span>
            </div>
          ) : isError || !supplier ? (
            <div className="py-8 text-center text-destructive text-sm font-semibold">
              Failed to load supplier details.
            </div>
          ) : (
            <>
              {/* Primary Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Contact Person
                  </div>
                  <div className="text-sm font-bold text-foreground">{supplier.contactPerson}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone Number
                  </div>
                  <div className="text-sm font-bold text-foreground">{supplier.phone}</div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </div>
                  <div className="text-sm font-semibold text-foreground truncate">
                    {supplier.email || "—"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" /> Type & Status
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                      {supplier.supplierType || "General"}
                    </span>
                    <StatusBadge status={supplier.status || "Active"} />
                  </div>
                </div>
              </div>

              {/* Additional Meta Details */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Registration & Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Company Name:</span>
                    <span className="font-semibold text-foreground">{supplier.companyName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">NTN / Registration No:</span>
                    <span className="font-semibold text-foreground">{supplier.registrationNumber || "—"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px] flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address:
                    </span>
                    <span className="font-medium text-foreground">{supplier.address || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Bank Accounts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4" /> Bank Accounts ({supplier.bankAccounts?.length || 0})
                </h4>

                {!supplier.bankAccounts || supplier.bankAccounts.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                    No bank accounts associated with this supplier.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supplier.bankAccounts.map((b) => (
                      <div
                        key={b.id || b.accountNumber}
                        className={`p-4 rounded-xl border ${
                          b.isPrimary ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                        } space-y-2 text-xs`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-foreground flex items-center gap-2">
                            {b.bankName}
                            {b.isPrimary && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                                Primary
                              </span>
                            )}
                          </span>
                          <span className="font-mono text-muted-foreground text-[11px]">
                            {b.branchName ? `${b.branchName} (${b.branchCode || "—"})` : ""}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-border/50">
                          <div>
                            <span className="block text-[10px] uppercase font-semibold">Account Title</span>
                            <span className="font-semibold text-foreground">{b.accountTitle}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-semibold">Account Number</span>
                            <span className="font-mono font-semibold text-foreground">{b.accountNumber}</span>
                          </div>
                          {b.iban && (
                            <div className="sm:col-span-2">
                              <span className="block text-[10px] uppercase font-semibold">IBAN</span>
                              <span className="font-mono text-foreground">{b.iban}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-glow hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
