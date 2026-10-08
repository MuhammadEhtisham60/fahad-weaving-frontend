import React, { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  GitFork,
  Layers,
  Disc,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, SectionTitle, StatusBadge, Button, fmt } from "../../../../../components/ui-kit.jsx";

export function AvailableSetTable({
  sets = [],
  beams = [],
  looms = [],
  onSelectSet,
  onTrace,
  isLoading = false,
}) {
  const [q, setQ] = useState("");
  const [sizingMillFilter, setSizingMillFilter] = useState("All");

  // Distinct sizing mill names for filtering
  const sizingMills = Array.from(
    new Set(
      sets
        .map((s) => s.sizingName || s.sizingUnit || s.sizingDetail?.sizingName)
        .filter(Boolean)
    )
  );

  const filteredSets = sets.filter((s) => {
    const setNo = (s.setNo || s.sizingNo || `SET-${s.id}`).toLowerCase();
    const brand = (s.brand || s.yarnName || "").toLowerCase();
    const mill = (s.sizingName || s.sizingUnit || s.sizingDetail?.sizingName || "").toLowerCase();
    const mark = (s.yarnBeam || "").toLowerCase();
    const count = (s.count || "").toLowerCase();

    const matchesQ =
      setNo.includes(q.toLowerCase()) ||
      brand.includes(q.toLowerCase()) ||
      mill.includes(q.toLowerCase()) ||
      mark.includes(q.toLowerCase()) ||
      count.includes(q.toLowerCase());

    const matchesMill =
      sizingMillFilter === "All" ||
      (s.sizingName || s.sizingUnit || s.sizingDetail?.sizingName) === sizingMillFilter;

    return matchesQ && matchesMill;
  });

  return (
    <Card padded={false}>
      {/* Header */}
      <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SectionTitle title="Available Sizing Sets" className="mb-0" />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {sets.length} {sets.length === 1 ? "Set" : "Sets"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Overview of returned sizing batches ready for loom allocation. Click any set to view full technical specifications and mount beams.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-muted/20 border-b border-border flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Set #, Brand, Sizing Mill, Yarn Count, or Beam Mark..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm shadow-sm"
          />
        </div>

        {sizingMills.length > 0 && (
          <select
            value={sizingMillFilter}
            onChange={(e) => setSizingMillFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm shadow-sm font-medium"
          >
            <option value="All">All Sizing Mills</option>
            {sizingMills.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider font-semibold border-b border-border">
            <tr>
              <th className="text-left px-5 py-3.5">Set No & Mark</th>
              <th className="text-left px-5 py-3.5">Sizing Mill</th>
              <th className="text-left px-5 py-3.5">Yarn & Count</th>
              <th className="text-left px-5 py-3.5">Width & Ends</th>
              <th className="text-right px-5 py-3.5">Set Length</th>
              <th className="text-center px-5 py-3.5">Beams Inventory</th>
              <th className="text-left px-5 py-3.5">Status</th>
              <th className="text-right px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredSets.map((s) => {
              // Calculate beams count for this set
              const setBeamIds = new Set(
                (s.beamAssignments || s.beam_assignments || [])
                  .map((a) => a.beamId || a.beam_id || a.beam?.id || a.beam)
                  .concat(s.beamIds || s.beam_ids || [])
              );

              const setBeams = beams.filter(
                (b) => setBeamIds.has(b.id) || b.sizingId === s.id || b.sizingNo === s.setNo
              );

              const totalBeamsCount = setBeams.length || s.totalBeams || 0;
              const availableCount = setBeams.filter(
                (b) => b.status === "Available" || b.status === "Ready for Loom" || b.status === "Created"
              ).length;
              const mountedCount = setBeams.filter(
                (b) => b.status === "In Production" || b.status === "Loaded" || Boolean(b.currentLoomNo)
              ).length;

              return (
                <tr
                  key={s.id}
                  className="hover:bg-muted/40 transition-colors cursor-pointer group"
                  onClick={() => onSelectSet(s)}
                >
                  {/* Set No & Mark */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-foreground text-sm flex items-center gap-1.5">
                          {s.setNo || `SET-${s.id}`}
                          {s.yarnBeam && (
                            <span className="text-[10px] font-medium font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                              {s.yarnBeam}
                            </span>
                          )}
                        </div>
                        {s.outcomeDate && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>{s.outcomeDate}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Sizing Mill */}
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">
                      {s.sizingName || s.sizingUnit || s.sizingDetail?.sizingName || "Direct Sizing"}
                    </div>
                    {s.totalBagsOnSizing > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {s.totalBagsOnSizing} Bags ({fmt(s.totalCones || 0)} Cones)
                      </div>
                    )}
                  </td>

                  {/* Yarn & Count */}
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">{s.brand || s.yarnName || "Cotton"}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {s.count ? `Count: ${s.count}` : "—"}
                    </div>
                  </td>

                  {/* Width & Ends */}
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">
                      {s.width ? `${s.width}" Width` : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.totalTarr ? `${fmt(s.totalTarr)} Ends (Tarr)` : "—"}
                    </div>
                  </td>

                  {/* Set Length */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="font-bold text-foreground">
                      {s.setLengthMeter ? `${fmt(s.setLengthMeter)} m` : "—"}
                    </div>
                    {s.setLengthGaz && (
                      <div className="text-xs text-muted-foreground">
                        ≈ {fmt(s.setLengthGaz)} Gaz
                      </div>
                    )}
                  </td>

                  {/* Beams Inventory */}
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {availableCount} Available
                        </span>
                        {mountedCount > 0 && (
                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {mountedCount} Mounted
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-0.5">
                        {totalBeamsCount} Total {totalBeamsCount === 1 ? "Beam" : "Beams"}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Ready for Looms
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="px-5 py-3.5 text-right whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      {onTrace && (
                        <button
                          type="button"
                          onClick={() => onTrace(s, "sizing")}
                          title="Trace Sizing Set Lineage"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        >
                          <GitFork className="h-4 w-4 text-purple-500" />
                        </button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectSet(s)}
                        className="flex items-center gap-1.5 cursor-pointer text-xs h-8 px-3"
                      >
                        <Eye className="h-3.5 w-3.5 text-primary" /> View Details
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredSets.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground">
                  <Layers className="h-8 w-8 mx-auto mb-2 opacity-30 text-primary" />
                  <div className="font-semibold text-foreground text-sm">No Available Sizing Sets Found</div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {q || sizingMillFilter !== "All"
                      ? "Try clearing search filters to see other sizing sets."
                      : "When sizing runs return from the sizing mill, their complete sets will appear here ready to allocate to looms."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
