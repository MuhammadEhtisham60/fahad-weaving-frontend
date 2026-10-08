import React from "react";
import { X, ArrowRight, Package, Workflow, Disc, Factory, Shirt, Calendar, User, CheckCircle2 } from "lucide-react";
import { Button, StatusBadge, fmt } from "../../../../components/ui-kit.jsx";

export function TraceabilityModal({ item, type, allData, onClose }) {
  if (!item) return null;

  const { rawMaterials = [], sizingEntries = [], beams = [], looms = [] } = allData || {};

  let targetRawMaterial = null;
  let targetSizing = null;
  let targetBeam = null;
  let targetLoom = null;

  if (type === "raw-material") {
    targetRawMaterial = item;
    targetSizing = sizingEntries.find((s) => s.rawMaterialId === item.id || s.rawMaterialEntry === item.entryNo);
    if (targetSizing) {
      targetBeam = beams.find((b) => b.sizingId === targetSizing.id || b.sizingNo === targetSizing.sizingNo);
      if (targetBeam && targetBeam.currentLoomId) {
        targetLoom = looms.find((l) => l.id === targetBeam.currentLoomId || l.loomNo === targetBeam.currentLoomNo);
      }
    }
  } else if (type === "sizing") {
    targetSizing = item;
    targetRawMaterial = rawMaterials.find((r) => r.id === item.rawMaterialId || r.entryNo === item.rawMaterialEntry);
    targetBeam = beams.find((b) => b.sizingId === item.id || b.sizingNo === item.sizingNo);
    if (targetBeam && targetBeam.currentLoomId) {
      targetLoom = looms.find((l) => l.id === targetBeam.currentLoomId || l.loomNo === targetBeam.currentLoomNo);
    }
  } else if (type === "beam") {
    targetBeam = item;
    targetSizing = sizingEntries.find((s) => s.id === item.sizingId || s.sizingNo === item.sizingNo);
    targetRawMaterial = rawMaterials.find((r) => r.id === item.rawMaterialId || (targetSizing && r.id === targetSizing.rawMaterialId));
    if (item.currentLoomId || item.currentLoomNo) {
      targetLoom = looms.find((l) => l.id === item.currentLoomId || l.loomNo === item.currentLoomNo);
    }
  } else if (type === "loom") {
    targetLoom = item;
    if (item.currentBeamId || item.currentBeamNo) {
      targetBeam = beams.find((b) => b.id === item.currentBeamId || b.beamNo === item.currentBeamNo);
      if (targetBeam) {
        targetSizing = sizingEntries.find((s) => s.id === targetBeam.sizingId || s.sizingNo === targetBeam.sizingNo);
        targetRawMaterial = rawMaterials.find((r) => r.id === targetBeam.rawMaterialId || (targetSizing && r.id === targetSizing.rawMaterialId));
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 scrollbar-custom">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-1">
              <span>Full Manufacturing Traceability</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Trace Lineage: {item.entryNo || item.sizingNo || item.beamNo || item.loomNo || item.name}
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

        {/* Traceability Flow Diagram */}
        <div className="space-y-4">
          {/* Stage 1: Raw Material */}
          <div className={`p-4 rounded-xl border transition-smooth ${targetRawMaterial ? "bg-muted/30 border-blue-500/40" : "bg-muted/10 border-border opacity-60"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-500">Stage 1 · Raw Material Source</div>
                  <div className="font-bold text-foreground">{targetRawMaterial ? targetRawMaterial.name : "Raw Material Record Not Linked"}</div>
                </div>
              </div>
              {targetRawMaterial && <StatusBadge status={targetRawMaterial.status} />}
            </div>
            {targetRawMaterial ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-border/50 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Entry No / Batch</span>
                  <span className="font-mono font-semibold">{targetRawMaterial.entryNo} ({targetRawMaterial.lotNo})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Supplier</span>
                  <span className="font-medium">{targetRawMaterial.supplier}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Intake Bags / Net Wt</span>
                  <span className="font-semibold">{targetRawMaterial.bags} Bags ({fmt(targetRawMaterial.netWeight)} kg)</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Sent to Sizing</span>
                  <span className="font-semibold text-amber-500">{targetRawMaterial.bagsSent} Bags ({fmt(targetRawMaterial.weightSent)} kg)</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic mt-2">No raw material lot record linked to this chain.</div>
            )}
          </div>

          <div className="flex justify-center my-1">
            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
          </div>

          {/* Stage 2: Sizing Run */}
          <div className={`p-4 rounded-xl border transition-smooth ${targetSizing ? "bg-muted/30 border-amber-500/40" : "bg-muted/10 border-border opacity-60"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Workflow className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Stage 2 · Sizing & Warping Run</div>
                  <div className="font-bold text-foreground">{targetSizing ? `${targetSizing.sizingNo} — ${targetSizing.yarnName}` : "Sizing Record Not Linked"}</div>
                </div>
              </div>
              {targetSizing && <StatusBadge status={targetSizing.status} />}
            </div>
            {targetSizing ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-border/50 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Sizing Mill / Unit</span>
                  <span className="font-medium truncate">{targetSizing.sizingUnit}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Bags & Weight Sized</span>
                  <span className="font-semibold">{targetSizing.bagsSent} Bags ({fmt(targetSizing.weightSent)} kg)</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Beams Produced</span>
                  <span className="font-semibold text-purple-500">{targetSizing.beamsProduced} Warp Beams</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Return Date</span>
                  <span className="font-medium">{targetSizing.actualReturn || targetSizing.expectedReturn || "In Process"}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic mt-2">No sizing entry linked directly to this record.</div>
            )}
          </div>

          <div className="flex justify-center my-1">
            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
          </div>

          {/* Stage 3: Beam Batch */}
          <div className={`p-4 rounded-xl border transition-smooth ${targetBeam ? "bg-muted/30 border-purple-500/40" : "bg-muted/10 border-border opacity-60"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Disc className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-500">Stage 3 · Warp Beam Specification</div>
                  <div className="font-bold text-foreground">{targetBeam ? `${targetBeam.beamNo} (${targetBeam.beamCode})` : "Beam Record Not Linked"}</div>
                </div>
              </div>
              {targetBeam && <StatusBadge status={targetBeam.status} />}
            </div>
            {targetBeam ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-border/50 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Beam Specs</span>
                  <span className="font-medium">{targetBeam.ends} Ends · {targetBeam.width}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Length & Weight</span>
                  <span className="font-semibold">{fmt(targetBeam.length)} m · {targetBeam.weight} kg</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Mounted On Loom</span>
                  <span className="font-bold text-primary">{targetBeam.currentLoomNo || "Not Mounted (Rack)"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Woven Meters</span>
                  <span className="font-semibold text-emerald-500">{fmt(targetBeam.producedMeters || 0)} m Woven</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic mt-2">No beam record linked to this chain.</div>
            )}
          </div>

          <div className="flex justify-center my-1">
            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
          </div>

          {/* Stage 4: Loom Production */}
          <div className={`p-4 rounded-xl border transition-smooth ${targetLoom ? "bg-muted/30 border-emerald-500/40" : "bg-muted/10 border-border opacity-60"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Factory className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Stage 4 · Loom Weaving Floor</div>
                  <div className="font-bold text-foreground">{targetLoom ? `${targetLoom.loomNo} — ${targetLoom.name}` : "Loom Not Currently Assigned"}</div>
                </div>
              </div>
              {targetLoom && <StatusBadge status={targetLoom.status} />}
            </div>
            {targetLoom ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-border/50 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Loom Type & Model</span>
                  <span className="font-medium">{targetLoom.type} ({targetLoom.model})</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Location Shed</span>
                  <span className="font-medium">{targetLoom.location}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Operator</span>
                  <span className="font-medium">{targetLoom.operator || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">Loom RPM / Efficiency</span>
                  <span className="font-bold text-emerald-500">{targetLoom.rpm} RPM · {targetLoom.efficiency || "90%"}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic mt-2">Currently not mounted on any active loom.</div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
