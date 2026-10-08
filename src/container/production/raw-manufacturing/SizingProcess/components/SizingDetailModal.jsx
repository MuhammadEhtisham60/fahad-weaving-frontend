import React from "react";
import {
  X,
  Workflow,
  Disc,
  GitFork,
  Plus,
  Factory,
  Layers,
  Calendar,
  Package,
  Sliders,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button, StatusBadge, fmt } from "../../../../../components/ui-kit.jsx";

export function SizingDetailModal({
  item,
  beams = [],
  onAddOutcome,
  onCreateBeam,
  onMountBeam,
  onTrace,
  onClose,
}) {
  if (!item) return null;

  const isInSizing = item.status === "In Sizing" || item.isInSizing;
  const setNo = item.setNo || item.sizingNo || `SET-${item.id}`;
  const rawBeams = (Array.isArray(item.beams) && item.beams.length > 0 ? item.beams : [])
    .concat(Array.isArray(item.beamAssignments) && item.beamAssignments.length > 0 ? item.beamAssignments : [])
    .concat(beams.filter((b) => b.sizingId === item.id || b.sizingNo === setNo));

  const beamList = Array.from(
    new Map(rawBeams.filter((b) => typeof b === "object" && b.id).map((b) => [b.id, b])).values()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 scrollbar-custom">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-xs font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                  {setNo}
                </span>
                <StatusBadge status={item.status} />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {item.count ? `${item.count} ` : ""}{item.brand || item.yarnName || "Sized Warp Set"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Set Length
            </span>
            <span className="text-base font-mono font-bold text-foreground">
              {fmt(item.setLengthMeter)} m
            </span>
            {item.setLengthGaz > 0 && (
              <span className="text-xs font-mono text-muted-foreground block">
                {fmt(item.setLengthGaz)} gaz
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Assigned Beams
            </span>
            <span className="text-base font-bold text-purple-500 flex items-center gap-1">
              <Disc className="h-4 w-4" /> {item.totalBeams || beamList.length || 0} Beams
            </span>
            <span className="text-xs text-muted-foreground block">Physical Assets</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Sizing Mill
            </span>
            <span className="text-sm font-semibold text-foreground truncate block">
              {item.sizingName || item.sizingUnit || "Sizing Mill"}
            </span>
            <span className="text-xs text-muted-foreground block">
              {item.sizingDetail?.contactPerson || "Partner Unit"}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Return Date
            </span>
            <span className="text-sm font-semibold text-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {item.outcomeDate || item.date || "—"}
            </span>
            <span className="text-xs text-emerald-500 font-medium block">Received</span>
          </div>
        </div>

        {/* Section: Sizing Bags & Cones Balance */}
        <div className="p-4 rounded-xl border border-border mb-6 space-y-3 bg-muted/10">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-primary" /> Sizing Bags & Cones Balance
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-card border border-border">
              <span className="text-muted-foreground block text-[11px]">Total Bags on Sizing</span>
              <span className="text-sm font-bold text-foreground">{fmt(item.totalBagsOnSizing || item.bagsSent)} Bags</span>
              <span className="text-[10px] text-muted-foreground block">Packing: {item.bagPackingCone || 24} cones/bag</span>
            </div>

            <div className="p-3 rounded-lg bg-card border border-border">
              <span className="text-muted-foreground block text-[11px]">Lagat (Consumed) Bags</span>
              <span className="text-sm font-bold text-amber-500">{fmt(item.lagatBags)} Bags</span>
              <span className="text-[10px] text-muted-foreground block">{fmt(item.lagatCones)} Cones consumed</span>
            </div>

            <div className="p-3 rounded-lg bg-card border border-border">
              <span className="text-muted-foreground block text-[11px]">Remaining Sizing Stock</span>
              <span className="text-sm font-bold text-emerald-500">{fmt(item.remainingBagsOnSizingStock)} Bags</span>
              <span className="text-[10px] text-muted-foreground block">{fmt(item.remainingConesOnSizingStock)} Cones left in mill</span>
            </div>

            <div className="p-3 rounded-lg bg-card border border-border">
              <span className="text-muted-foreground block text-[11px]">Total Cones</span>
              <span className="text-sm font-bold text-foreground">{fmt(item.totalCones)} Cones</span>
              <span className="text-[10px] text-muted-foreground block">Total yarn batch</span>
            </div>
          </div>
        </div>

        {/* Section: Technical Dimensions & Identifiers */}
        <div className="p-4 rounded-xl border border-border mb-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-primary" /> Technical Warp Specifications
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Yarn Count</span>
              <span className="font-mono font-bold text-foreground">{item.count || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Fabric Width</span>
              <span className="font-semibold text-foreground">{item.width ? `${item.width}"` : "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Total Tarr / Ends</span>
              <span className="font-mono font-bold text-foreground">{item.totalTarr ? fmt(item.totalTarr) : "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Total Shortage</span>
              <span className="font-semibold text-foreground">{item.totalSetShortage ? `${item.totalSetShortage}%` : "0%"}</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Yarn Beam ID</span>
              <span className="font-mono font-semibold text-foreground">{item.yarnBeam || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Yarn Brand</span>
              <span className="font-semibold text-foreground">{item.brand || "—"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border/60">
              <span className="text-muted-foreground">Total Set Lumbai</span>
              <span className="font-mono font-semibold text-foreground">{fmt(item.totalSetLumbai || item.setLengthMeter)} m</span>
            </div>
          </div>
        </div>

        {/* Section: Warp Beams Loaded & Loom Assignments */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Disc className="h-3.5 w-3.5 text-purple-500" /> Physical Warp Beams Assigned ({beamList.length})
            </h4>
            <div className="flex items-center gap-2">
              {isInSizing && onAddOutcome && (
                <Button size="sm" onClick={() => onAddOutcome(item)}>
                  <Layers className="h-3.5 w-3.5" /> Return Sizing Set
                </Button>
              )}
              {!isInSizing && onMountBeam && (
                <Button size="sm" onClick={() => onMountBeam(item)}>
                  <Factory className="h-3.5 w-3.5" /> Mount onto Loom
                </Button>
              )}
            </div>
          </div>

          {beamList.length > 0 ? (
            <div className="space-y-2">
              {beamList.map((b, idx) => (
                <div
                  key={b.id || idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Disc className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono font-bold text-foreground">
                        {b.beamCode || b.beamNumber || `BEAM #${b.id}`}
                      </div>
                      <div className="text-muted-foreground">
                        {b.beamName || "Warp Beam"} {b.ends ? `· ${b.ends} Ends` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="font-semibold text-foreground">
                      {fmt(b.length || item.setLengthMeter)} m
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Status: {b.status || "Assigned"}
                    </span>
                  </div>

                  <div className="text-right">
                    <StatusBadge status={b.status || (isInSizing ? "Assigned" : "Loaded")} />
                    {b.loomCode || b.currentLoomNo ? (
                      <span className="text-[10px] font-semibold text-primary block mt-1">
                        Mounted on {b.loomCode || b.currentLoomNo}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground block mt-1">
                        {isInSizing ? "In Sizing" : "Ready for Loom"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-muted/20 border border-dashed border-border text-center text-xs text-muted-foreground space-y-2">
              <p>No physical warp beams have been assigned or loaded for this sizing set yet.</p>
              {!isInSizing && onMountBeam && (
                <Button size="sm" onClick={() => onMountBeam(item)} className="mx-auto">
                  <Factory className="h-3.5 w-3.5" /> Load Beam onto Loom
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Operational Remarks */}
        {item.remarks && (
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs mb-6">
            <span className="font-bold text-muted-foreground uppercase text-[10px] block mb-1">
              Sizing Recipe, Quality & Operational Notes
            </span>
            <p className="text-foreground leading-relaxed">{item.remarks}</p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onTrace(item, "sizing")}>
            <GitFork className="h-4 w-4 text-purple-500" /> Trace Full Lineage
          </Button>
          <div className="flex items-center gap-2">
            {isInSizing && onAddOutcome && (
              <Button onClick={() => onAddOutcome(item)}>
                <Layers className="h-4 w-4" /> Return Sizing Set
              </Button>
            )}
            {!isInSizing && onMountBeam && (
              <Button onClick={() => onMountBeam(item)}>
                <Factory className="h-4 w-4" /> Mount onto Loom
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
