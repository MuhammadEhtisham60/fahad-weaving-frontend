import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  GitFork,
  Plus,
  Disc,
  Factory,
  RefreshCw,
  Layers,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, SectionTitle, StatusBadge, Button, fmt } from "../../../../../components/ui-kit.jsx";
import { useGetSizingChoicesQuery } from "../../../../../store/index.js";

export function SizingTable({
  rows = [],
  isLoading = false,
  isFetching = false,
  onRefetch,
  onSelect,
  onEdit,
  onDelete,
  onTrace,
  onAddOutcome,
  onCreateBeam,
  onLoadOntoLoom,
  onAddNew,
}) {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [unitFilter, setUnitFilter] = useState("All");

  // Fetch live sizing choices for the dynamic dropdown filter
  const { data: sizingChoicesData } = useGetSizingChoicesQuery();

  const dynamicSizingUnits = useMemo(() => {
    const rawList = Array.isArray(sizingChoicesData)
      ? sizingChoicesData
      : Array.isArray(sizingChoicesData?.data)
      ? sizingChoicesData.data
      : Array.isArray(sizingChoicesData?.results)
      ? sizingChoicesData.results
      : [];

    const fromApi = rawList.map((c) => c.label || c.name || c.sizingName).filter(Boolean);
    const fromRows = rows.map((r) => r.sizingName || r.sizingUnit).filter(Boolean);
    return Array.from(new Set([...fromApi, ...fromRows]));
  }, [sizingChoicesData, rows]);

  const filtered = useMemo(() => {
    return rows.filter((s) => {
      const qLower = q.toLowerCase();
      const matchesQ =
        !q ||
        (s.setNo && s.setNo.toLowerCase().includes(qLower)) ||
        (s.sizingNo && s.sizingNo.toLowerCase().includes(qLower)) ||
        (s.sizingName && s.sizingName.toLowerCase().includes(qLower)) ||
        (s.sizingUnit && s.sizingUnit.toLowerCase().includes(qLower)) ||
        (s.count && s.count.toLowerCase().includes(qLower)) ||
        (s.brand && s.brand.toLowerCase().includes(qLower)) ||
        (s.yarnName && s.yarnName.toLowerCase().includes(qLower)) ||
        (s.rawMaterialRef && s.rawMaterialRef.toLowerCase().includes(qLower)) ||
        (s.yarnIntakeDetail?.yarnLot && s.yarnIntakeDetail.yarnLot.toLowerCase().includes(qLower)) ||
        (s.remarks && s.remarks.toLowerCase().includes(qLower)) ||
        (s.beamAssignments &&
          s.beamAssignments.some((b) =>
            (b.beamCode || b.beamNumber || "").toLowerCase().includes(qLower)
          ));

      const matchesStatus =
        statusFilter === "All" ||
        s.status === statusFilter ||
        (statusFilter === "In Sizing" && (s.status === "In Sizing" || s.isInSizing)) ||
        (statusFilter === "Outcome" && (s.status === "Outcome" || s.status === "Received")) ||
        (statusFilter === "Loaded" &&
          (s.status === "Loaded onto Beams" || s.status === "Loaded" || s.totalBeams > 0));

      const currentUnit = s.sizingName || s.sizingUnit || "";
      const matchesUnit = unitFilter === "All" || currentUnit === unitFilter;

      return matchesQ && matchesStatus && matchesUnit;
    });
  }, [rows, q, statusFilter, unitFilter]);

  return (
    <Card padded={false}>
      {/* Header bar */}
      <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10">
        <div>
          <div className="flex items-center gap-2">
            <SectionTitle title="Sizing Process & Outcomes" className="mb-0" />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Live API
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track yarn dispatched to sizing mills, record incoming sizing outcomes, and verify assigned warp beams
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRefetch && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefetch}
              disabled={isFetching}
              title="Refresh Sizing Process from API"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="p-4 bg-muted/20 border-b border-border flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Set #, Yarn Intake Ref, Sizing Mill, Count, Brand, Beam..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground"
        >
          <option value="All">All Statuses</option>
          <option value="In Sizing">In Sizing</option>
          <option value="Outcome">Outcome / Received</option>
          <option value="Loaded onto Beams">Loaded onto Beams</option>
          <option value="In Production">In Production</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={unitFilter}
          onChange={(e) => setUnitFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-sm text-foreground max-w-[220px] truncate"
        >
          <option value="All">All Sizing Mills</option>
          {dynamicSizingUnits.map((su) => (
            <option key={su} value={su}>
              {su}
            </option>
          ))}
        </select>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-[11px] uppercase text-muted-foreground tracking-wider font-semibold">
            <tr>
              <th className="text-left px-4 py-3.5">Yarn Ref / Set #</th>
              <th className="text-left px-4 py-3.5">Yarn Brand & Count</th>
              <th className="text-right px-4 py-3.5">Quantity / Cones</th>
              <th className="text-center px-4 py-3.5">Assigned Beam(s)</th>
              <th className="text-left px-4 py-3.5">Sizing Mill / Party</th>
              <th className="text-left px-4 py-3.5">Send / Outcome Date</th>
              <th className="text-left px-4 py-3.5">Status</th>
              <th className="text-right px-4 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-xs font-medium">Loading Sizing Records from API...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Layers className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-foreground">No sizing records found</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Dispatch yarn boxes from the <strong>Yarn Intake</strong> table to Sizing to populate the sizing pipeline.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const totalBeams = s.totalBeams || s.beamAssignments?.length || s.beams?.length || 0;
                const beamList = s.beamAssignments || s.beams || [];
                const isInSizing = s.status === "In Sizing" || s.isInSizing;

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-muted/30 transition-smooth cursor-pointer"
                    onClick={() => onSelect(s)}
                  >
                    {/* Yarn Intake Ref & Set Number */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-foreground text-xs flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        {s.setNo || `SET-${s.id}`}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <span className="font-mono">{s.rawMaterialRef || (s.yarnIntakeId ? `INTAKE-${s.yarnIntakeId}` : "—")}</span>
                        {s.yarnIntakeDetail?.yarnLot && (
                          <span className="text-xs font-medium text-foreground/80">· Lot: {s.yarnIntakeDetail.yarnLot}</span>
                        )}
                      </div>
                    </td>

                    {/* Yarn Brand & Count */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">
                        {s.count ? <span className="font-mono font-bold text-primary mr-1.5">{s.count}</span> : null}
                        <span>{s.brand || s.yarnName}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                        {s.width > 0 && <span>Width: {s.width}&quot;</span>}
                        {s.totalTarr > 0 && <span>· Tarr: {fmt(s.totalTarr)}</span>}
                        {s.setLengthMeter > 0 && <span>· Length: {fmt(s.setLengthMeter)}m</span>}
                      </div>
                    </td>

                    {/* Quantity / Bags & Cones */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="font-semibold text-foreground">
                        {fmt(s.totalBagsOnSizing || s.bagsSent || 0)} Bags
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fmt(s.totalCones || 0)} Cones
                      </div>
                    </td>

                    {/* Assigned Physical Beam(s) */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border ${
                            totalBeams > 0
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 shadow-sm"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          <Disc className="h-3 w-3" /> {totalBeams} Beam{totalBeams === 1 ? "" : "s"}
                        </span>
                        {beamList.length > 0 && (
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate max-w-[130px]" title={beamList.map((b) => b.beamCode || b.beamNumber).filter(Boolean).join(", ")}>
                            {beamList.map((b) => b.beamCode || b.beamNumber).filter(Boolean).join(", ")}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Sizing Mill / Party */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground max-w-[170px] truncate">
                        {s.sizingName || s.sizingUnit || "Sizing Unit"}
                      </div>
                      {s.sizingDetail?.contactPerson && (
                        <div className="text-[11px] text-muted-foreground">
                          {s.sizingDetail.contactPerson}
                        </div>
                      )}
                    </td>

                    {/* Send Date & Outcome Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-xs text-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>Send: {s.sendDate || s.date || "—"}</span>
                      </div>
                      {s.outcomeDate ? (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Return: {s.outcomeDate}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>Pending Outcome</span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={s.status} />
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3.5 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Primary Action for In Sizing: Return Sizing Set */}
                        {isInSizing ? (
                          <button
                            type="button"
                            onClick={() => (onAddOutcome ? onAddOutcome(s) : onEdit(s))}
                            title="Return Sizing Set & Record Outcome"
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-sm transition-smooth flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Layers className="h-3.5 w-3.5" /> Return Sizing Set
                          </button>
                        ) : (
                          <>
                            {/* Mount Beam onto Loom (Only for Received / Loaded sets) */}
                            {onLoadOntoLoom && (
                              <button
                                type="button"
                                onClick={() => onLoadOntoLoom(s)}
                                title="Mount Beam onto Loom (Beam Loading)"
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-sm transition-smooth flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              >
                                <Factory className="h-3.5 w-3.5" /> Mount on Loom
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onEdit(s)}
                              title="Edit Sizing Outcome Set"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth cursor-pointer"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDelete(s.id)}
                              title="Delete Sizing Outcome"
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => onTrace(s, "sizing")}
                          title="Trace Set Lineage"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-purple-500 hover:bg-purple-500/10 transition-smooth cursor-pointer"
                        >
                          <GitFork className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelect(s)}
                          title="View Sizing Record Details"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
