import React from "react";
import { X, Factory, Phone, Mail, MapPin, User, FileText, Clock, Loader2 } from "lucide-react";
import { useGetSizingByIdQuery } from "../../../../store/index.js";
import { StatusBadge } from "../../../../components/ui-kit.jsx";

export function SizingViewModal({ sizingId, onClose, onEdit }) {
  const { data: sizing, isLoading, isError } = useGetSizingByIdQuery(sizingId);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {sizing?.sizingName || "Sizing Unit Details"}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Sizing company and facility specifications
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
              <span className="text-xs font-semibold">Fetching sizing details...</span>
            </div>
          ) : isError || !sizing ? (
            <div className="py-8 text-center text-destructive text-sm font-semibold">
              Failed to load sizing details.
            </div>
          ) : (
            <>
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-0.5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </div>
                  <div className="pt-0.5">
                    <StatusBadge status={sizing.status || "Active"} />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-0.5 sm:col-span-2">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Sizing Unit Name
                  </div>
                  <div className="text-sm font-bold text-foreground truncate">
                    {sizing.sizingName}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" /> Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Contact Person:</span>
                    <span className="font-semibold text-foreground">{sizing.contactPerson || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Phone / Contact No:</span>
                    <span className="font-mono font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {sizing.contactNumber || sizing.phoneNo || "—"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Email Address:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      {sizing.email || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Mill / Factory Address
                </h4>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {sizing.address || "No address provided."}
                </p>
              </div>

              {/* Notes */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" /> Notes & Remarks
                </h4>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {sizing.notes || "No notes entered for this sizing unit."}
                </p>
              </div>

              {/* Audit Metadata */}
              <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2 text-xs">
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Audit Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                  <div>
                    <span className="text-[11px]">Created By: </span>
                    <span className="font-medium text-foreground">
                      {sizing.createdBy?.fullName || sizing.createdBy?.username || (typeof sizing.createdBy === "string" ? sizing.createdBy : "—")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px]">Created At: </span>
                    <span className="font-medium text-foreground">
                      {formatDate(sizing.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px]">Updated By: </span>
                    <span className="font-medium text-foreground">
                      {sizing.updatedBy?.fullName || sizing.updatedBy?.username || (typeof sizing.updatedBy === "string" ? sizing.updatedBy : "—")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px]">Updated At: </span>
                    <span className="font-medium text-foreground">
                      {formatDate(sizing.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
          <div>
            {onEdit && sizing && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(sizing.id);
                }}
                className="h-9 px-4 rounded-lg border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-colors"
              >
                Edit Sizing
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-glow hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
