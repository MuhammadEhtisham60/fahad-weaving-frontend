import React from "react";
import { X, Disc, Factory, GitFork, Play, Square, Calendar, User, Clock, CheckCircle2 } from "lucide-react";
import { Button, StatusBadge, fmt } from "../../../../../components/ui-kit.jsx";

export function BeamDetailModal({ item, looms = [], onMount, onDismount, onTrace, onClose }) {
  if (!item) return null;

  const isMounted = Boolean(item.currentLoomId || item.currentLoomNo);
  const targetLoom = looms.find((l) => l.id === item.currentLoomId);
  const historyList = item.history || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 scrollbar-custom">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-muted-foreground uppercase">{item.beamNo}</span>
              <StatusBadge status={item.status} />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Warp Beam: {item.beamCode} ({item.yarnName})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`p-4 rounded-xl border mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isMounted ? "bg-emerald-500/10 border-emerald-500/30" : "bg-muted/40 border-border"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                isMounted ? "bg-emerald-500 text-white shadow-glow" : "bg-muted text-muted-foreground"
              }`}
            >
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Current Loom Status
              </span>
              <div className="font-bold text-foreground text-sm">
                {isMounted ? (
                  <span>
                    Mounted on Loom <strong className="text-primary font-mono">{item.currentLoomNo}</strong> ({targetLoom?.name || "Loom"})
                  </span>
                ) : (
                  <span>Available in Warp Storage Rack (Not Mounted)</span>
                )}
              </div>
              {isMounted && item.installationDate && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  Installed on {item.installationDate} · Woven {fmt(item.producedMeters || 0)} / {fmt(item.length)} meters
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMounted ? (
              <Button size="sm" variant="danger" onClick={() => onDismount(targetLoom, item)}>
                <Square className="h-3.5 w-3.5" /> Dismount Beam
              </Button>
            ) : (item.status === "Available" || item.status === "Ready for Loom" || item.status === "Created") ? (
              <Button size="sm" onClick={() => onMount(null, item)}>
                <Play className="h-3.5 w-3.5" /> Mount onto Loom
              </Button>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Total Ends
            </span>
            <span className="text-base font-bold text-foreground">{fmt(item.ends)} Ends</span>
            <span className="text-xs text-muted-foreground block">{item.width}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Warp Length
            </span>
            <span className="text-base font-bold text-foreground">{fmt(item.length)} m</span>
            <span className="text-xs text-muted-foreground block">{item.weight} kg net</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Sizing Reference
            </span>
            <span className="text-sm font-mono font-bold text-primary">{item.sizingNo}</span>
            <span className="text-xs text-muted-foreground block">Lot: {item.lotNo}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Sizing Pickup
            </span>
            <span className="text-base font-bold text-foreground">{item.sizingPickup || "9.8%"}</span>
            <span className="text-xs text-emerald-500 block">Quality Approved</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Loom Movement & Lifetime Traceability
          </h4>

          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2.5">Date</th>
                  <th className="text-left px-4 py-2.5">Action</th>
                  <th className="text-left px-4 py-2.5">Target Loom</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-left px-4 py-2.5">Operator & Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {historyList.map((h, i) => (
                  <tr key={h.id || i} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-mono text-muted-foreground">{h.date}</td>
                    <td className="px-4 py-2.5 font-semibold text-foreground">{h.action}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-primary">{h.loomNo}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={h.status} />
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <span className="font-medium text-foreground">{h.operator}</span> — {h.remarks}
                    </td>
                  </tr>
                ))}
                {historyList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                      Initial creation log only.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {item.remarks && (
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs mb-6">
            <span className="font-bold text-muted-foreground uppercase text-[10px] block mb-1">Notes</span>
            <p className="text-foreground">{item.remarks}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onTrace(item, "beam")}>
            <GitFork className="h-4 w-4 text-purple-500" /> Trace Full Lineage
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
