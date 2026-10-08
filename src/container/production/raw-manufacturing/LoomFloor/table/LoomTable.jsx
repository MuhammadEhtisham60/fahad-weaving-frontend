import React, { useState } from "react";
import { Search, Filter, Eye, Edit3, Trash2, GitFork, Plus, Factory, Disc, Play, Square, LayoutGrid, List } from "lucide-react";
import { Card, SectionTitle, StatusBadge, Button, fmt } from "../../../../../components/ui-kit.jsx";
import { LOOM_STATUSES, LOOM_TYPES, DEPARTMENTS } from "../../utils/constants.js";

export function LoomTable({
  rows = [],
  beams = [],
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
  const [typeFilter, setTypeFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table");

  const filtered = rows.filter((l) => {
    const matchesQ =
      l.loomNo.toLowerCase().includes(q.toLowerCase()) ||
      l.name.toLowerCase().includes(q.toLowerCase()) ||
      l.type.toLowerCase().includes(q.toLowerCase()) ||
      l.manufacturer.toLowerCase().includes(q.toLowerCase()) ||
      l.location.toLowerCase().includes(q.toLowerCase()) ||
      (l.currentBeamNo && l.currentBeamNo.toLowerCase().includes(q.toLowerCase()));
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    const matchesType = typeFilter === "All" || l.type === typeFilter;
    return matchesQ && matchesStatus && matchesType;
  });

  return (
    <Card padded={false}>
      <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <SectionTitle title="Weaving Looms Master & Floor Status" className="mb-0" />
          <p className="text-xs text-muted-foreground mt-0.5">
            Loom shed floor status, live warp beam installation, operator assignment, and speed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-muted rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-smooth ${
                viewMode === "table" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-smooth ${
                viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Floor Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <Button size="sm" onClick={onAddNew}>
            <Plus className="h-4 w-4" /> Add Loom
          </Button>
        </div>
      </div>

      <div className="p-4 bg-muted/20 border-b border-border flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by loom #, name, manufacturer, location, or beam #..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm"
        >
          <option value="All">All Statuses</option>
          {LOOM_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm"
        >
          <option value="All">All Loom Types</option>
          {LOOM_TYPES.map((lt) => (
            <option key={lt} value={lt}>
              {lt}
            </option>
          ))}
        </select>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="text-left px-5 py-3.5">Loom No / Name</th>
                <th className="text-left px-5 py-3.5">Type & Manufacturer</th>
                <th className="text-left px-5 py-3.5">Location / Shed</th>
                <th className="text-left px-5 py-3.5">Width & RPM</th>
                <th className="text-left px-5 py-3.5">Mounted Beam</th>
                <th className="text-left px-5 py-3.5">Status</th>
                <th className="text-right px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => {
                const activeBeam = beams.find((b) => b.id === l.currentBeamId);
                const hasBeam = Boolean(l.currentBeamId || l.currentBeamNo);

                return (
                  <tr
                    key={l.id}
                    className="border-t border-border hover:bg-muted/30 transition-smooth cursor-pointer"
                    onClick={() => onSelect(l)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-mono font-bold text-foreground">{l.loomNo}</div>
                      <div className="text-xs text-muted-foreground">{l.name}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">{l.type}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.manufacturer} · {l.model}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">{l.location}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">{l.department}</div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{l.width}</div>
                      <div className="text-xs text-emerald-500 font-mono">{l.rpm} RPM · {l.efficiency || "90%"}</div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {hasBeam ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                            <Disc className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-mono font-bold text-primary">{l.currentBeamNo}</span>
                            <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                              {activeBeam?.yarnName || "Warp Beam"}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None (Idle)</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={l.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {hasBeam ? (
                          <button
                            type="button"
                            onClick={() => onDismount && onDismount(l, activeBeam)}
                            title="Dismount Current Beam"
                            className="px-2 py-1 rounded-md text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth flex items-center gap-1"
                          >
                            <Square className="h-3 w-3" /> Dismount
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onMount && onMount(l, null)}
                            title="Mount Available Beam"
                            className="px-2 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-smooth flex items-center gap-1"
                          >
                            <Play className="h-3 w-3" /> Mount
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onTrace(l, "loom")}
                          title="Trace Full Lineage"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                        >
                          <GitFork className="h-4 w-4 text-purple-500" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelect(l)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onEdit(l)}
                          title="Edit Loom"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(l.id)}
                          title="Delete Loom"
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
                    No looms match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((l) => {
            const activeBeam = beams.find((b) => b.id === l.currentBeamId);
            const isRunning = l.status === "Running";

            return (
              <div
                key={l.id}
                className={`p-4 rounded-xl border transition-smooth hover:shadow-elegant cursor-pointer flex flex-col justify-between ${
                  isRunning ? "bg-card border-emerald-500/40" : "bg-muted/30 border-border"
                }`}
                onClick={() => onSelect(l)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-base text-foreground">{l.loomNo}</span>
                    <StatusBadge status={l.status} />
                  </div>
                  <div className="font-semibold text-sm text-foreground">{l.name}</div>
                  <div className="text-xs text-muted-foreground">{l.type}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {l.location} · {l.rpm} RPM
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border">
                  {activeBeam ? (
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">Active Beam</div>
                      <div className="text-xs font-semibold text-primary truncate">
                        {activeBeam.beamNo} ({activeBeam.yarnName})
                      </div>
                      <div className="text-[11px] text-emerald-500 font-mono">
                        {fmt(activeBeam.producedMeters || 0)} / {fmt(activeBeam.length)} m woven
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground italic py-1">
                      No beam installed (Idle)
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onTrace(l, "loom")}
                      className="text-xs text-purple-500 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <GitFork className="h-3.5 w-3.5" /> Trace
                    </button>

                    {activeBeam ? (
                      <Button size="sm" variant="danger" onClick={() => onDismount && onDismount(l, activeBeam)}>
                        <Square className="h-3 w-3" /> Dismount
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => onMount && onMount(l, null)}>
                        <Play className="h-3 w-3" /> Mount Beam
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
