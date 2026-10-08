import React from "react";
import { X, Layers, FileText, Activity, Clock, Loader2 } from "lucide-react";
import { useGetBeamByIdQuery } from "../../../../store/index.js";
import { StatusBadge } from "../../../../components/ui-kit.jsx";

export function BeamViewModal({ beamId, onClose, onEdit }) {
  const { data: beam, isLoading, isError } = useGetBeamByIdQuery(beamId);

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
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">
                  {beam?.beamNumber || "Beam Details"}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {beam?.beamName || "Warp beam specifications and status"}
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
              <span className="text-xs font-semibold">Fetching beam details...</span>
            </div>
          ) : isError || !beam ? (
            <div className="py-8 text-center text-destructive text-sm font-semibold">
              Failed to load beam details.
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
                    <StatusBadge status={beam.status || "Available"} />
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-0.5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Length
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {beam.length != null ? `${beam.length} m` : "—"}
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-0.5">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Weight
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {beam.weight != null ? `${beam.weight} kg` : "—"}
                  </div>
                </div>
              </div>

              {/* Specification Details */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-primary" /> Specification Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Beam Number:</span>
                    <span className="font-mono font-semibold text-foreground">{beam.beamNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Beam Name:</span>
                    <span className="font-semibold text-foreground">{beam.beamName || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" /> Notes & Instructions
                </h4>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {beam.notes || "No notes entered for this beam."}
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
                      {beam.createdBy?.fullName || beam.createdBy?.username || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px]">Created At: </span>
                    <span className="font-medium text-foreground">
                      {formatDate(beam.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px]">Updated By: </span>
                    <span className="font-medium text-foreground">
                      {beam.updatedBy?.fullName || beam.updatedBy?.username || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px]">Updated At: </span>
                    <span className="font-medium text-foreground">
                      {formatDate(beam.updatedAt)}
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
            {onEdit && beam && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(beam.id);
                }}
                className="h-9 px-4 rounded-lg border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-colors"
              >
                Edit Beam
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

