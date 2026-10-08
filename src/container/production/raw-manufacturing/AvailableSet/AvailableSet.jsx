import React, { useState } from "react";
import { AvailableSetTable } from "./table/AvailableSetTable.jsx";
import { BeamTable } from "./table/BeamTable.jsx";
import { AvailableSetDetailModal } from "./components/AvailableSetDetailModal.jsx";
import {
  Layers,
  Disc,
  Plus,
} from "lucide-react";
import { Button } from "../../../../components/ui-kit.jsx";

export function AvailableSet({
  rows = [],
  sizingEntries = [],
  looms = [],
  onSelect,
  onEdit,
  onDelete,
  onTrace,
  onMount,
  onDismount,
  onAddNew,
  isLoading = false,
}) {
  const [activeSubView, setActiveSubView] = useState("sets"); // "sets" | "beams"
  const [selectedSetDetail, setSelectedSetDetail] = useState(null);

  // Filter completed / returned sizing outcomes that represent Available Sizing Sets
  const availableSizingSets = sizingEntries.filter((sz) => {
    return sz.status === "Completed" || (!sz.isInSizing && sz.status !== "In Sizing");
  });

  return (
    <div className="space-y-6">
      {/* View Switcher & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Available Sizing Sets & Warp Beams</h2>
            <p className="text-xs text-muted-foreground">
              Returned ready sizing sets and individual warp beams ready for loom mounting
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-muted rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setActiveSubView("sets")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubView === "sets"
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              Available Sets ({availableSizingSets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView("beams")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubView === "beams"
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Disc className="h-3.5 w-3.5" />
              All Beams ({rows.length})
            </button>
          </div>

          <Button size="sm" onClick={onAddNew} className="cursor-pointer">
            <Plus className="h-4 w-4" /> Add Warp Beam
          </Button>
        </div>
      </div>

      {/* VIEW 1: AVAILABLE SIZED SETS (CLEAN TABLE VIEW) */}
      {activeSubView === "sets" ? (
        <AvailableSetTable
          sets={availableSizingSets}
          beams={rows}
          looms={looms}
          onSelectSet={(set) => setSelectedSetDetail(set)}
          onTrace={onTrace}
          isLoading={isLoading}
        />
      ) : (
        /* VIEW 2: MASTER BEAMS TABLE */
        <BeamTable
          rows={rows}
          looms={looms}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onTrace={onTrace}
          onMount={(loom, beam) => onMount(loom, beam, null)}
          onDismount={onDismount}
          onAddNew={onAddNew}
        />
      )}

      {/* Available Set Complete Detail Modal */}
      {selectedSetDetail && (
        <AvailableSetDetailModal
          item={selectedSetDetail}
          beams={rows}
          looms={looms}
          onMount={onMount}
          onDismount={onDismount}
          onTrace={onTrace}
          onClose={() => setSelectedSetDetail(null)}
        />
      )}
    </div>
  );
}
