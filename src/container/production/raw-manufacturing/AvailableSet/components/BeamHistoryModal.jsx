import React, { useState } from "react";
import { X, History, Disc, Factory, Layers, Calendar, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import {
  useGetBeamSizingHistoryQuery,
  useGetBeamLoadingHistoryQuery,
} from "../../../../../store/index.js";
import { StatusBadge, fmt } from "../../../../../components/ui-kit.jsx";

export function BeamHistoryModal({ beamId, beamCode, onClose }) {
  const [activeTab, setActiveTab] = useState("sizing"); // "sizing" | "loading"

  const { data: sizingHistoryData, isLoading: loadingSizing } = useGetBeamSizingHistoryQuery(beamId, {
    skip: !beamId,
  });

  const { data: loadingHistoryData, isLoading: loadingMounts } = useGetBeamLoadingHistoryQuery(beamId, {
    skip: !beamId,
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">Multi-Cycle Beam History</h2>
                <span className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono font-bold text-foreground">
                  {beamCode || sizingHistoryData?.beamCode || `Beam #${beamId}`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Persistent audit trail across all sizing cycles and loom production loadings
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

        {/* Tab Toggle */}
        <div className="px-6 pt-3 pb-0 border-b border-border flex items-center gap-4 bg-muted/10">
          <button
            type="button"
            onClick={() => setActiveTab("sizing")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "sizing"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" /> Sizing Cycles ({sizingHistoryData?.history?.length ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("loading")}
            className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === "loading"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Factory className="h-4 w-4" /> Loom Loadings ({loadingHistoryData?.history?.length ?? 0})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-custom">
          {activeTab === "sizing" ? (
            loadingSizing ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                Loading sizing cycles history...
              </div>
            ) : !sizingHistoryData?.history || sizingHistoryData.history.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No past sizing cycles found for this beam.
              </div>
            ) : (
              <div className="space-y-3">
                {sizingHistoryData.history.map((cycle, idx) => (
                  <div
                    key={cycle.assignmentId || idx}
                    className="p-4 rounded-xl border border-border bg-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-xs text-foreground">
                          {cycle.sizingOutcome?.sizing?.sizingName || "Sizing Mill"}
                        </span>
                        {cycle.sizingOutcome?.setNo && (
                          <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono text-muted-foreground">
                            {cycle.sizingOutcome.setNo}
                          </span>
                        )}
                      </div>
                      <StatusBadge status={cycle.status} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span>Assigned: </span>
                        <strong className="text-foreground">{formatDate(cycle.assignedAt)}</strong>
                      </div>
                      <div>
                        <span>Released: </span>
                        <strong className="text-foreground">{formatDate(cycle.releasedAt)}</strong>
                      </div>
                      <div>
                        <span>Outcome Date: </span>
                        <strong className="text-foreground">{formatDate(cycle.sizingOutcome?.outcomeDate)}</strong>
                      </div>
                    </div>

                    {cycle.sizingOutcome?.remarks && (
                      <p className="text-xs text-foreground bg-muted/20 p-2.5 rounded-lg border border-border/50">
                        {cycle.sizingOutcome.remarks}
                      </p>
                    )}

                    {cycle.sizingOutcome?.dispatchedYarns?.length > 0 && (
                      <div className="text-[11px] text-muted-foreground border-t border-border/50 pt-2 flex flex-wrap gap-2">
                        {cycle.sizingOutcome.dispatchedYarns.map((yarn) => (
                          <span key={yarn.id} className="bg-muted px-2 py-0.5 rounded font-mono">
                            {yarn.yarnName} ({yarn.yarnCount}) · {yarn.outcomeBags} bags ({yarn.outcomeWeightKg} kg)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : loadingMounts ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              Loading loom mounting history...
            </div>
          ) : !loadingHistoryData?.history || loadingHistoryData.history.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs">
              No past loom loadings recorded for this beam.
            </div>
          ) : (
            <div className="space-y-3">
              {loadingHistoryData.history.map((mount, idx) => (
                <div
                  key={mount.id || idx}
                  className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        Loom {mount.loomCode || mount.loom}
                      </span>
                      {mount.setNo && (
                        <span className="px-2 py-0.5 rounded bg-muted text-[11px] font-mono text-muted-foreground">
                          {mount.setNo}
                        </span>
                      )}
                      <StatusBadge status={mount.status || "Completed"} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Installed on {formatDate(mount.installationDate)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Total Meters Woven
                    </span>
                    <span className="text-base font-bold text-primary font-mono">
                      {fmt(mount.totalMetersProduced || 0)} m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end bg-muted/30">
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
