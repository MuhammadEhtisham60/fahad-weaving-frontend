import React from "react";
import { X, Cpu, Hash, Calendar, MapPin, FileText, Activity, Clock, Loader2, ShieldCheck } from "lucide-react";
import { useGetLoomByIdQuery } from "../../../../store/index.js";
import { StatusBadge } from "../../../../components/ui-kit.jsx";

export function LoomViewModal({ loomId, onClose, onEdit }) {
  const { data: loom, isLoading, isError } = useGetLoomByIdQuery(loomId);

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
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {loom?.loomName || "Loom Details"}
                </h2>
                {loom?.loomCode && (
                  <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono text-muted-foreground font-semibold">
                    {loom.loomCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {loom?.modelNumber ? `Model: ${loom.modelNumber}` : "Weaving machinery unit"}
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
              <span className="text-xs font-semibold">Fetching loom details...</span>
            </div>
          ) : isError || !loom ? (
            <div className="py-8 text-center text-destructive text-sm font-semibold">
              Failed to load loom details.
            </div>
          ) : (
            <>
              {/* Highlight Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-0.5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </div>
                  <div className="pt-0.5">
                    <StatusBadge status={loom.status || "Active"} />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-0.5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Model Number
                  </div>
                  <div className="text-sm font-bold text-foreground truncate">
                    {loom.modelNumber || "—"}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-0.5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Width
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {loom.width != null ? `${loom.width} cm` : "—"}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-0.5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Location
                  </div>
                  <div className="text-sm font-bold text-foreground truncate">
                    {loom.location || "—"}
                  </div>
                </div>
              </div>

              {/* Machinery & Specs Info */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Technical Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Loom Code:</span>
                    <span className="font-mono font-semibold text-foreground">{loom.loomCode || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Model Number:</span>
                    <span className="font-semibold text-foreground">{loom.modelNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Width:</span>
                    <span className="font-semibold text-foreground">{loom.width != null ? `${loom.width} cm` : "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Installation Date:</span>
                    <span className="font-semibold text-foreground">{loom.installationDate || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Location / Hall:</span>
                    <span className="font-semibold text-foreground">{loom.location || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Status:</span>
                    <span className="font-semibold text-foreground">{loom.status || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" /> Notes & Operational Remarks
                </h4>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {loom.notes || "No notes entered for this loom."}
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
                      {loom.createdBy?.fullName || loom.createdBy?.username || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px]">Created At: </span>
                    <span className="font-medium text-foreground">
                      {formatDate(loom.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px]">Updated By: </span>
                    <span className="font-medium text-foreground">
                      {loom.updatedBy?.fullName || loom.updatedBy?.username || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px]">Updated At: </span>
                    <span className="font-medium text-foreground">
                      {formatDate(loom.updatedAt)}
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
            {onEdit && loom && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(loom.id);
                }}
                className="h-9 px-4 rounded-lg border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-colors"
              >
                Edit Loom
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
