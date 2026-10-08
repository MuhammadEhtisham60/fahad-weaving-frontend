import React from "react";
import {
  X,
  Layers,
  Disc,
  Play,
  Square,
  Factory,
  Calendar,
  CheckCircle2,
  GitFork,
  Scale,
  Ruler,
  Hash,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Card, StatusBadge, Button, fmt } from "../../../../../components/ui-kit.jsx";
import { useGetOutcomeBeamsQuery, useGetSizingOutcomeByIdQuery } from "../../../../../store/sizingOutcomeApiSlice.js";

export function AvailableSetDetailModal({
  item,
  beams = [],
  looms = [],
  onMount,
  onDismount,
  onTrace,
  onClose,
}) {
  if (!item) return null;

  // Query backend for latest outcome details and assigned beams on-demand
  const { data: outcomeData, isLoading: isLoadingOutcome } = useGetSizingOutcomeByIdQuery(
    item.id,
    { skip: !item?.id }
  );

  const { data: beamsResponse, isLoading: isLoadingBeams } = useGetOutcomeBeamsQuery(
    item.id,
    { skip: !item?.id }
  );

  const effectiveSet = outcomeData || item;

  // Extract beam IDs from item or fetched data
  const fetchedAssignments =
    beamsResponse?.assignments ||
    effectiveSet?.beamAssignments ||
    effectiveSet?.beam_assignments ||
    [];

  const setBeamIds = new Set(
    fetchedAssignments
      .map((a) => a.beamId || a.beam_id || a.beam?.id || a.beam)
      .concat(effectiveSet.beamIds || effectiveSet.beam_ids || [])
  );

  // Map physical beams by merging full beam store with assignment records
  let setBeams = beams.filter(
    (b) =>
      setBeamIds.has(b.id) ||
      b.sizingId === effectiveSet.id ||
      b.sizingNo === effectiveSet.setNo
  );

  // If beams array didn't have all details (e.g. initial load), populate from assignments
  if (setBeams.length === 0 && fetchedAssignments.length > 0) {
    setBeams = fetchedAssignments
      .map((a) => {
        const b = a.beam || {};
        return {
          id: b.id || a.beamId || a.beam_id,
          beamNo: b.beamNumber || b.beamName || `BN-${String(b.id || a.beamId).padStart(3, "0")}`,
          beamCode: b.beamNumber || `BM-${b.id}`,
          beamName: b.beamName || "Warp Beam",
          yarnCount: b.yarnCount || effectiveSet.count || "—",
          ends: b.totalEnds || b.warpCount || effectiveSet.totalTarr || 0,
          length: Number(b.length || effectiveSet.setLengthMeter || 0),
          weight: Number(b.weight || 0),
          width: effectiveSet.width || "—",
          status: b.status || a.status || "Available",
          currentLoomId: b.currentLoomId || null,
          currentLoomNo: b.currentLoomNo || null,
        };
      })
      .filter((b) => Boolean(b.id));
  }

  const availableBeams = setBeams.filter(
    (b) =>
      b.status === "Available" ||
      b.status === "Ready for Loom" ||
      b.status === "Created"
  );
  const mountedBeams = setBeams.filter(
    (b) =>
      b.status === "In Production" ||
      b.status === "Loaded" ||
      Boolean(b.currentLoomNo)
  );

  const isLoading = isLoadingOutcome || isLoadingBeams;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 scrollbar-custom">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow shrink-0">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
                  SET REF: {effectiveSet.setNo || `SET-${effectiveSet.id}`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Ready for Loom Production
                </span>
                {effectiveSet.brand && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                    {effectiveSet.brand}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {effectiveSet.sizingName || effectiveSet.sizingUnit || "Sizing Unit Set"}
                {effectiveSet.yarnBeam ? ` · Mark: ${effectiveSet.yarnBeam}` : ""}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onTrace && (
              <button
                type="button"
                onClick={() => onTrace(effectiveSet, "sizing")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth cursor-pointer"
                title="Trace Sizing Set Lineage"
              >
                <GitFork className="h-5 w-5 text-purple-500" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Hero KPI Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Set Length
            </span>
            <span className="text-base font-bold text-foreground">
              {effectiveSet.setLengthMeter ? `${fmt(effectiveSet.setLengthMeter)} m` : "—"}
            </span>
            <span className="text-xs text-muted-foreground block">
              {effectiveSet.setLengthGaz ? `≈ ${fmt(effectiveSet.setLengthGaz)} Gaz` : ""}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Warp Width & Ends
            </span>
            <span className="text-base font-bold text-foreground">
              {effectiveSet.width ? `${effectiveSet.width}" Width` : "—"}
            </span>
            <span className="text-xs text-muted-foreground block">
              {effectiveSet.totalTarr ? `${fmt(effectiveSet.totalTarr)} Ends (Tarr)` : ""}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Yarn Count & Brand
            </span>
            <span className="text-base font-bold text-foreground">
              {effectiveSet.count || "—"}
            </span>
            <span className="text-xs text-muted-foreground block truncate">
              {effectiveSet.brand || effectiveSet.yarnName || "100% Cotton"}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Beams Status
            </span>
            <span className="text-base font-bold text-primary">
              {availableBeams.length} Available
            </span>
            <span className="text-xs text-muted-foreground block">
              {mountedBeams.length} of {setBeams.length || effectiveSet.totalBeams || 0} Mounted
            </span>
          </div>
        </div>

        {/* Sizing Specification Matrix */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" /> Technical Sizing Outcome Parameters
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-card text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Outcome Date:</span>
              <strong className="text-foreground">{effectiveSet.outcomeDate || "—"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Sizing Mill:</span>
              <strong className="text-foreground">{effectiveSet.sizingName || effectiveSet.sizingUnit || "—"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Total Bags on Sizing:</span>
              <strong className="text-foreground">{effectiveSet.totalBagsOnSizing || "—"} Bags</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Packing Cones/Bag:</span>
              <strong className="text-foreground">{effectiveSet.bagPackingCone || "24"} Cones</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Total Cones Dispatched:</span>
              <strong className="text-foreground">{fmt(effectiveSet.totalCones || 0)} Cones</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Lagat (Consumed) Bags:</span>
              <strong className="text-foreground">{effectiveSet.lagatBags || "—"} Bags</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Lagat Cones:</span>
              <strong className="text-foreground">{fmt(effectiveSet.lagatCones || 0)} Cones</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Remaining Sizing Stock:</span>
              <strong className="text-foreground">
                {effectiveSet.remainingBagsOnSizingStock ?? 0} Bags ({fmt(effectiveSet.remainingConesOnSizingStock ?? 0)} Cones)
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Total Set Shortage:</span>
              <strong className="text-foreground">{effectiveSet.totalSetShortage ? `${effectiveSet.totalSetShortage}%` : "0%"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Yarn Beam Mark:</span>
              <strong className="text-foreground font-mono">{effectiveSet.yarnBeam || "—"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Total Set Lumbai:</span>
              <strong className="text-foreground">{effectiveSet.totalSetLumbai ? `${fmt(effectiveSet.totalSetLumbai)} m` : "—"}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Created By / Status:</span>
              <strong className="text-foreground">{effectiveSet.createdBy?.fullName || "Production Manager"}</strong>
            </div>
          </div>
        </div>

        {/* Remarks / Notes if any */}
        {effectiveSet.remarks && (
          <div className="p-3.5 rounded-xl bg-muted/20 border border-border text-xs mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Operational Recipe & Remarks
            </span>
            <p className="text-muted-foreground italic">{effectiveSet.remarks}</p>
          </div>
        )}

        {/* Physical Warp Beams Belonging to this Available Set */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Disc className="h-4 w-4 text-primary" /> Physical Warp Beams in this Set ({setBeams.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Individual beams sized in this batch ready to be loaded one by one onto weaving looms
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-border text-muted-foreground flex flex-col items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
              <span className="text-xs">Loading physical warp beams...</span>
            </div>
          ) : setBeams.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-border text-muted-foreground text-xs">
              No physical warp beams attached to this set.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {setBeams.map((beam) => {
                const isMounted =
                  beam.status === "In Production" ||
                  beam.status === "Loaded" ||
                  Boolean(beam.currentLoomNo);
                const targetLoom = looms.find((l) => l.id === beam.currentLoomId);

                return (
                  <div
                    key={beam.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isMounted
                        ? "bg-muted/20 border-border opacity-90"
                        : "bg-card border-primary/20 shadow-sm hover:border-primary/40 hover:shadow-md"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-foreground">
                            {beam.beamNo || beam.beamCode}
                          </span>
                          <span className="text-xs text-muted-foreground">({beam.beamName || "Warp Beam"})</span>
                        </div>
                        <StatusBadge status={beam.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground my-2">
                        <div>
                          <span>Count:</span> <strong className="text-foreground">{beam.yarnCount || effectiveSet.count || "—"}</strong>
                        </div>
                        <div>
                          <span>Total Ends:</span> <strong className="text-foreground">{fmt(beam.ends || effectiveSet.totalTarr || 0)}</strong>
                        </div>
                        <div>
                          <span>Warp Length:</span> <strong className="text-foreground">{fmt(beam.length || effectiveSet.setLengthMeter || 0)} m</strong>
                        </div>
                        <div>
                          <span>Width:</span> <strong className="text-foreground">{beam.width || effectiveSet.width || "—"}</strong>
                        </div>
                      </div>

                      {isMounted && (
                        <div className="pt-2 border-t border-border flex items-center gap-2 text-xs font-semibold text-primary">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>
                            Active on Loom <strong className="font-mono">{beam.currentLoomNo || targetLoom?.loom_code}</strong> ({targetLoom?.name || "Running"})
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onTrace && onTrace(beam, "beam")}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                      >
                        <GitFork className="h-3.5 w-3.5 text-purple-500" /> Trace Beam
                      </button>

                      {isMounted ? (
                        <button
                          type="button"
                          onClick={() => onDismount && onDismount(targetLoom, beam)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth cursor-pointer"
                        >
                          Dismount
                        </button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            onClose();
                            onMount && onMount(null, beam, effectiveSet);
                          }}
                          className="cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5" /> Mount onto Loom
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border flex items-center justify-end">
          <Button variant="outline" onClick={onClose} className="cursor-pointer">
            Close Details
          </Button>
        </div>
      </div>
    </div>
  );
}
