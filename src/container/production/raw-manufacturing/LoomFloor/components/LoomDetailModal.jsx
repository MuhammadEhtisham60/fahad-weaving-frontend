import React from "react";
import { X, Factory, Disc, Play, Square, GitFork, Calendar, MapPin, Gauge, ShieldCheck, User } from "lucide-react";
import { Button, StatusBadge, fmt } from "../../../../../components/ui-kit.jsx";

export function LoomDetailModal({ item, beams = [], onMount, onDismount, onTrace, onClose }) {
  if (!item) return null;

  const activeBeam = beams.find((b) => b.id === item.currentBeamId);
  const hasBeam = Boolean(item.currentBeamId || item.currentBeamNo);
  const beamHistoryList = item.beamHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 scrollbar-custom">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-muted-foreground uppercase">{item.loomNo}</span>
              <StatusBadge status={item.status} />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {item.name} — {item.type}
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
            hasBeam ? "bg-card border-emerald-500/40 shadow-sm" : "bg-muted/40 border-border"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                hasBeam ? "bg-gradient-primary text-white shadow-glow" : "bg-muted text-muted-foreground"
              }`}
            >
              <Disc className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Mounted Warp Beam
              </span>
              <div className="font-bold text-foreground text-sm">
                {hasBeam ? (
                  <span>
                    Beam <strong className="text-primary font-mono">{item.currentBeamNo}</strong> ({activeBeam?.yarnName || "Warp Beam"})
                  </span>
                ) : (
                  <span>No Warp Beam Mounted (Loom is currently Idle)</span>
                )}
              </div>
              {hasBeam && activeBeam && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  Specs: {activeBeam.ends} Ends · {fmt(activeBeam.length)}m Warp · Woven {fmt(activeBeam.producedMeters || 0)}m
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasBeam ? (
              <Button size="sm" variant="danger" onClick={() => onDismount(item, activeBeam)}>
                <Square className="h-3.5 w-3.5" /> Dismount Beam
              </Button>
            ) : (
              <Button size="sm" onClick={() => onMount(item, null)}>
                <Play className="h-3.5 w-3.5" /> Mount Available Beam
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Speed / RPM
            </span>
            <span className="text-base font-bold text-emerald-500">{item.rpm} RPM</span>
            <span className="text-xs text-muted-foreground block">Efficiency: {item.efficiency || "92%"}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Working Width
            </span>
            <span className="text-base font-bold text-foreground">{item.width}</span>
            <span className="text-xs text-muted-foreground block">Max Fabric Width</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Manufacturer
            </span>
            <span className="text-sm font-semibold text-foreground truncate">{item.manufacturer}</span>
            <span className="text-xs text-muted-foreground block">{item.model}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Floor Location
            </span>
            <span className="text-sm font-semibold text-foreground truncate">{item.location}</span>
            <span className="text-xs text-muted-foreground block truncate">{item.department}</span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Beam Installation & Output History
          </h4>

          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2.5">Beam Number</th>
                  <th className="text-left px-4 py-2.5">Mounted Date</th>
                  <th className="text-left px-4 py-2.5">Dismount Date</th>
                  <th className="text-right px-4 py-2.5">Fabric Output</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {beamHistoryList.map((bh, idx) => (
                  <tr key={bh.id || idx} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-mono font-bold text-primary">{bh.beamNo}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{bh.installedAt || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{bh.removedAt || "Currently Running"}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-foreground">
                      {fmt(bh.metersProduced || 0)} meters
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        bh.removedAt ? "bg-muted text-muted-foreground border-border" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      }`}>
                        {bh.status || (bh.removedAt ? "Completed" : "Running")}
                      </span>
                    </td>
                  </tr>
                ))}
                {beamHistoryList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-muted-foreground">
                      No previous beam runs recorded for this loom yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {item.notes && (
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs mb-6">
            <span className="font-bold text-muted-foreground uppercase text-[10px] block mb-1">Floor Notes</span>
            <p className="text-foreground">{item.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onTrace(item, "loom")}>
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
