import React from "react";
import { X, Package, Workflow, GitFork, ArrowRight, Building, Calendar, Tag, ShieldCheck, MapPin } from "lucide-react";
import { Button, StatusBadge, fmt } from "../../../../../components/ui-kit.jsx";

export function RawMaterialDetailModal({ item, sizingEntries = [], onSendToSizing, onTrace, onClose }) {
  if (!item) return null;

  const linkedSizingRuns = sizingEntries.filter(
    (s) => s.rawMaterialId === item.id || s.rawMaterialEntry === item.entryNo
  );

  const totalBags = Number(item.bags) || 1;
  const sentBags = Number(item.bagsSent) || 0;
  const remainingBags = Number(item.availableBags) || 0;
  const pctSent = Math.min(100, Math.round((sentBags / totalBags) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 scrollbar-custom">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-muted-foreground uppercase">{item.entryNo}</span>
              <StatusBadge status={item.status} />
            </div>
            <h2 className="text-xl font-bold text-foreground">{item.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/40 border border-border mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Total Intake
            </span>
            <span className="text-base font-bold text-foreground">{fmt(item.bags)} Bags</span>
            <span className="text-xs text-muted-foreground block">
              {fmt(item.netWeight)} {item.unit || "lb"}
              {item.boxes ? ` · ${fmt(Number(item.bags) * Number(item.boxes))} Cones` : ""}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Sent to Sizing
            </span>
            <span className="text-base font-bold text-amber-500">{fmt(item.bagsSent || 0)} Bags</span>
            <span className="text-xs text-muted-foreground block">{fmt(item.weightSent || 0)} {item.unit || "lb"}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Available In Stock
            </span>
            <span className="text-base font-bold text-emerald-500">{fmt(item.availableBags || 0)} Bags</span>
            <span className="text-xs text-muted-foreground block">{fmt(item.availableWeight || 0)} {item.unit || "lb"}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Sizing Utilization
            </span>
            <span className="text-base font-bold text-foreground">{pctSent}%</span>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
              <div className="h-full bg-amber-500" style={{ width: `${pctSent}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-border space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Material Specs & Cones</h4>
            <div className="flex justify-between text-xs py-1 border-b border-border/50">
              <span className="text-muted-foreground">Yarn Count</span>
              <span className="font-semibold text-foreground">{item.count}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/50">
              <span className="text-muted-foreground">Yarn Type</span>
              <span className="font-semibold text-foreground">{item.yarnType}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/50">
              <span className="text-muted-foreground">Batch / Lot #</span>
              <span className="font-mono font-semibold text-foreground">{item.lotNo}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/50">
              <span className="text-muted-foreground">Cones per Bag</span>
              <span className="font-semibold text-foreground">{item.boxes || item.conesPerBag || 0} Cones/bag</span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-muted-foreground">Total Cones</span>
              <span className="font-bold text-primary font-mono">
                {fmt(item.totalCones || (Number(item.bags) * Number(item.boxes || 0)))} Cones
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Origin & Valuation</h4>
            <div className="flex justify-between text-xs py-1 border-b border-border/50">
              <span className="text-muted-foreground">Supplier</span>
              <span className="font-semibold text-foreground">{item.supplier}</span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/50">
              <span className="text-muted-foreground">Production Type</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${item.productionType === "Conversion" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-primary/10 text-primary border border-primary/20"}`}>
                {item.productionType || "Self"}
              </span>
            </div>
            <div className="flex justify-between text-xs py-1 border-b border-border/50">
              <span className="text-muted-foreground">Rate per Bag</span>
              <span className="font-mono font-semibold text-foreground">
                {item.ratePerBag ? `Rs ${fmt(item.ratePerBag)}` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-xs py-1">
              <span className="text-muted-foreground">Net Weight (KG)</span>
              <span className="font-mono font-semibold text-foreground">
                {item.netWeightKg ? `${fmt(item.netWeightKg)} kg` : `${fmt(Math.round(item.netWeight / 2.20462262))} kg`}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Linked Sizing Dispatches ({linkedSizingRuns.length})
            </h4>
            {remainingBags > 0 && (
              <Button size="sm" onClick={() => onSendToSizing(item)}>
                <Workflow className="h-3.5 w-3.5" /> Dispatch to Sizing
              </Button>
            )}
          </div>

          {linkedSizingRuns.length > 0 ? (
            <div className="space-y-2">
              {linkedSizingRuns.map((sz) => (
                <div
                  key={sz.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-foreground">{sz.sizingNo}</div>
                    <div className="text-muted-foreground truncate max-w-[240px]">{sz.sizingUnit}</div>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold text-foreground">{sz.bagsSent} Bags ({fmt(sz.weightSent)} kg)</span>
                    <span className="text-[10px] text-muted-foreground block">Dispatched on {sz.date}</span>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={sz.status} />
                    <span className="text-[10px] text-primary font-semibold block mt-1">
                      {sz.beamsProduced} Beams Made
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-muted/20 border border-border text-center text-xs text-muted-foreground">
              No sizing dispatches recorded yet for this yarn batch.
            </div>
          )}
        </div>

        {item.notes && (
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border text-xs mb-6">
            <span className="font-bold text-muted-foreground uppercase text-[10px] block mb-1">Remarks</span>
            <p className="text-foreground">{item.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onTrace(item, "raw-material")}>
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
