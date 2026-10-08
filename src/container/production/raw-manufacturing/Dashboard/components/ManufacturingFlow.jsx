import React from "react";
import { Package, Workflow, Disc, Factory, Shirt, ArrowRight, CheckCircle2 } from "lucide-react";
import { fmt } from "../../../../../components/ui-kit.jsx";

export function ManufacturingFlow({ stats, onSelectTab }) {
  const stages = [
    {
      id: "raw-material",
      step: "01",
      title: "Raw Material",
      subtitle: "Yarn Received & In-Stock",
      icon: Package,
      primaryMetric: `${fmt(stats.totalRawBags)} Bags`,
      secondaryMetric: `${fmt(stats.remainingRawBags)} Bags Available`,
      color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-500 dark:text-blue-400",
      accent: "bg-blue-500",
      activeText: "Central Store",
    },
    {
      id: "sizing",
      step: "02",
      title: "Sizing Process",
      subtitle: "Yarn Treated & Warped",
      icon: Workflow,
      primaryMetric: `${fmt(stats.totalBagsSentToSizing)} Bags Sent`,
      secondaryMetric: `${stats.activeSizingBatches} Active Sizing Runs`,
      color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-500 dark:text-amber-400",
      accent: "bg-amber-500",
      activeText: `${fmt(stats.sizingBagsInProgress)} Bags in Sizing`,
    },
    {
      id: "beams",
      step: "03",
      title: "Beams Created",
      subtitle: "Warp Beams Ready / Mounted",
      icon: Disc,
      primaryMetric: `${stats.totalBeams} Total Beams`,
      secondaryMetric: `${stats.availableBeams} Available / Ready`,
      color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-500 dark:text-purple-400",
      accent: "bg-purple-500",
      activeText: `${stats.beamsInProduction} Mounted on Looms`,
    },
    {
      id: "looms",
      step: "04",
      title: "Loom Weaving",
      subtitle: "Power Looms Shed",
      icon: Factory,
      primaryMetric: `${stats.runningLooms} / ${stats.totalLooms} Running`,
      secondaryMetric: `${stats.idleLooms} Idle · ${stats.maintenanceLooms} Maint.`,
      color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-500 dark:text-emerald-400",
      accent: "bg-emerald-500",
      activeText: `${stats.loomUtilization}% Shed Efficiency`,
    },
    {
      id: "assignment",
      step: "05",
      title: "Fabric Production",
      subtitle: "Woven Output Tracked",
      icon: Shirt,
      primaryMetric: `${fmt(stats.totalFabricWovenMeters)} Meters`,
      secondaryMetric: "Shirting & Greige Rolls",
      color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-500 dark:text-cyan-400",
      accent: "bg-cyan-500",
      activeText: "Live Weaving Flow",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-card p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-foreground tracking-tight text-base">Manufacturing Pipeline Flow</h3>
          </div>
          {/* <p className="text-xs text-muted-foreground mt-0.5">
            Interactive trace of materials from yarn intake through sizing and beam preparation to active loom weaving
          </p> */}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="px-2.5 py-1 rounded-full bg-muted border border-border">
            Overall Flow Status: <strong className="text-foreground">Optimal</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div key={stage.id} className="relative group">
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab(stage.id)}
                className={`w-full text-left p-4 rounded-xl border transition-smooth bg-gradient-to-br ${stage.color} hover:shadow-glow hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-full min-h-[140px]`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-8 w-8 rounded-lg bg-card/80 backdrop-blur border border-border/50 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-foreground" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-card/80 border border-border/50 text-foreground font-mono">
                      Stage {stage.step}
                    </span>
                  </div>
                  <div className="font-bold text-foreground text-sm tracking-tight">{stage.title}</div>
                  {/* <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{stage.subtitle}</div> */}
                </div>

                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="text-sm font-bold text-foreground">{stage.primaryMetric}</div>
                  <div className="text-[11px] text-muted-foreground font-medium truncate">{stage.secondaryMetric}</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-card/70 px-2 py-0.5 rounded-md border border-border/40">
                    <span className={`h-1.5 w-1.5 rounded-full ${stage.accent}`} />
                    {stage.activeText}
                  </div>
                </div>
              </button>

              {idx < stages.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full bg-card border border-border items-center justify-center text-muted-foreground shadow-sm pointer-events-none">
                  <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
