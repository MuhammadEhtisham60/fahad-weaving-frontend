import React, { useState } from "react";
import { Search, Filter, Eye, Edit3, Trash2, GitFork, Plus, Disc, Factory, ArrowRight, Play, Square } from "lucide-react";
import { Card, SectionTitle, StatusBadge, Button, fmt } from "../../../../../components/ui-kit.jsx";
import { BEAM_STATUSES } from "../../utils/constants.js";

export function BeamTable({
  rows = [],
  looms = [],
  onSelect,
  onEdit,
  onDelete,
  onTrace,
  onMount,
  onDismount,
  onAddNew,
}) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = rows.filter((b) => {
    const matchesQ =
      b.beamNo.toLowerCase().includes(q.toLowerCase()) ||
      b.beamCode.toLowerCase().includes(q.toLowerCase()) ||
      b.sizingNo.toLowerCase().includes(q.toLowerCase()) ||
      b.yarnName.toLowerCase().includes(q.toLowerCase()) ||
      (b.currentLoomNo && b.currentLoomNo.toLowerCase().includes(q.toLowerCase()));
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesQ && matchesStatus;
  });

  return (
    <Card padded={false}>
      <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <SectionTitle title="Warp Beams Master Inventory" className="mb-0" />
          <p className="text-xs text-muted-foreground mt-0.5">
            Individual beam specifications, ends count, warp length, and active loom mounting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onAddNew}>
            <Plus className="h-4 w-4" /> Add Warp Beam
          </Button>
        </div>
      </div>

      <div className="p-4 bg-muted/20 border-b border-border flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by beam #, code, sizing ref, yarn, or mounted loom..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm"
        >
          <option value="All">All Beam Statuses</option>
          {BEAM_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
            <tr>
              <th className="text-left px-5 py-3.5">Beam No</th>
              <th className="text-left px-5 py-3.5">Sizing Ref & Yarn</th>
              <th className="text-left px-5 py-3.5">Ends & Width</th>
              <th className="text-right px-5 py-3.5">Length / Weight</th>
              <th className="text-left px-5 py-3.5">Mounted Loom</th>
              <th className="text-left px-5 py-3.5">Status</th>
              <th className="text-right px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const isMounted = Boolean(b.currentLoomId || b.currentLoomNo);
              const targetLoom = looms.find((l) => l.id === b.currentLoomId);

              return (
                <tr
                  key={b.id}
                  className="border-t border-border hover:bg-muted/30 transition-smooth cursor-pointer"
                  onClick={() => onSelect(b)}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-mono font-bold text-foreground">{b.beamNo}</div>
                    {/* <div className="text-xs text-muted-foreground">{b.beamCode}</div> */}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">{b.yarnName}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      Ref: {b.sizingNo}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-foreground">{b.ends} Ends</div>
                    <div className="text-xs text-muted-foreground">{b.width}</div>
                  </td>

                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="font-bold text-foreground">{fmt(b.length)} m</div>
                    <div className="text-xs text-muted-foreground">{b.weight} kg</div>
                  </td>

                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {isMounted ? (
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono font-bold text-primary">{b.currentLoomNo}</span>
                        <span className="text-xs text-muted-foreground">({targetLoom?.name || "Loom"})</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">On Storage Rack</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    <StatusBadge status={b.status} />
                  </td>

                  <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {isMounted ? (
                        <button
                          type="button"
                          onClick={() => onDismount && onDismount(targetLoom, b)}
                          title="Dismount from Loom"
                          className="px-2 py-1 rounded-md text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth flex items-center gap-1"
                        >
                          <Square className="h-3 w-3" /> Dismount
                        </button>
                      ) : (b.status === "Available" || b.status === "Ready for Loom" || b.status === "Created") ? (
                        <button
                          type="button"
                          onClick={() => onMount && onMount(null, b)}
                          title="Mount onto Loom"
                          className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-smooth flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" /> Mount
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => onTrace(b, "beam")}
                        title="Trace Full Lineage"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                      >
                        <GitFork className="h-4 w-4 text-purple-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelect(b)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(b)}
                        title="Edit Beam"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(b.id)}
                        title="Delete Beam"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                  No warp beams match your search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
