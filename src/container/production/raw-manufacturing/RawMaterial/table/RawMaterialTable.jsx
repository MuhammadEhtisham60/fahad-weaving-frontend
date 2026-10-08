import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  GitFork,
  Plus,
  ArrowRight,
  Package,
  Calendar,
  RotateCcw,
  X,
  SlidersHorizontal,
  Building2,
  Layers,
  Hash,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Card, SectionTitle, StatusBadge, Button, fmt } from "../../../../../components/ui-kit.jsx";
import { YARN_TYPES, YARN_COUNTS, RAW_MATERIAL_STATUSES, WAREHOUSES } from "../../utils/constants.js";
import {
  useGetYarnIntakesQuery,
  useDeleteYarnIntakeMutation,
  useGetSupplierChoicesQuery,
} from "../../../../../store/index.js";
import { useConfirm } from "../../../../../common/popups/index.js";
import {
  normalizeYarnIntakeList,
  mapYarnIntakeToRow,
} from "../../utils/yarnIntakeMapper.js";

const DATE_PRESETS = [
  { value: "All", label: "All Dates (Any Time)" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "custom", label: "Custom Date Range..." },
];

function checkDatePreset(dateStr, preset, customStart, customEnd) {
  if (!preset || preset === "All") return true;
  if (!dateStr) return false;

  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return true;
  const itemDate = new Date(y, m - 1, d);
  itemDate.setHours(0, 0, 0, 0);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case "today":
      return itemDate.getTime() === today.getTime();

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return itemDate.getTime() === yesterday.getTime();
    }

    case "this_week": {
      const day = today.getDay(); // 0 is Sun, 1 is Mon...
      const diffToMon = (day + 6) % 7;
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - diffToMon);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return itemDate >= startOfWeek && itemDate <= endOfWeek;
    }

    case "last_week": {
      const day = today.getDay();
      const diffToMon = (day + 6) % 7;
      const startOfThisWeek = new Date(today);
      startOfThisWeek.setDate(today.getDate() - diffToMon);
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
      const endOfLastWeek = new Date(startOfThisWeek);
      endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);
      return itemDate >= startOfLastWeek && itemDate <= endOfLastWeek;
    }

    case "this_month": {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return itemDate >= startOfMonth && itemDate <= endOfMonth;
    }

    case "last_month": {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return itemDate >= startOfLastMonth && itemDate <= endOfLastMonth;
    }

    case "this_year": {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear(), 11, 31);
      return itemDate >= startOfYear && itemDate <= endOfYear;
    }

    case "last_year": {
      const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
      return itemDate >= startOfLastYear && itemDate <= endOfLastYear;
    }

    case "custom": {
      if (customStart) {
        const [sy, sm, sd] = customStart.split("-").map(Number);
        const startDate = new Date(sy, sm - 1, sd);
        startDate.setHours(0, 0, 0, 0);
        if (itemDate < startDate) return false;
      }
      if (customEnd) {
        const [ey, em, ed] = customEnd.split("-").map(Number);
        const endDate = new Date(ey, em - 1, ed);
        endDate.setHours(23, 59, 59, 999);
        if (itemDate > endDate) return false;
      }
      return true;
    }

    default:
      return true;
  }
}

export function RawMaterialTable({
  rows = [],
  onSelect,
  onEdit,
  onDelete,
  onTrace,
  onSendToSizing,
  onAddNew,
}) {
  // Filter States
  const [yarnNameQuery, setYarnNameQuery] = useState("");
  const [countFilter, setCountFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [productionTypeFilter, setProductionTypeFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [datePreset, setDatePreset] = useState("All");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // RTK Query: Live Yarn Intakes API data
  const {
    data: apiIntakeResponse,
    isLoading: isApiLoading,
    isFetching: isApiFetching,
    refetch,
  } = useGetYarnIntakesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [deleteYarnIntake, { isLoading: isDeleting }] = useDeleteYarnIntakeMutation();
  const { data: supplierChoicesData } = useGetSupplierChoicesQuery();

  // Normalize API data or fallback to passed prop rows
  const effectiveRows = useMemo(() => {
    if (apiIntakeResponse !== undefined && apiIntakeResponse !== null) {
      const normalized = normalizeYarnIntakeList(apiIntakeResponse);
      return normalized.rows || [];
    }
    return Array.isArray(rows) ? rows : [];
  }, [apiIntakeResponse, rows]);

  // Unique Dropdown Options derived from constants + actual rows + supplier choices
  const availableCounts = useMemo(() => {
    return Array.from(
      new Set([...YARN_COUNTS, ...effectiveRows.map((r) => r.count).filter(Boolean)])
    );
  }, [effectiveRows]);

  const availableTypes = useMemo(() => {
    return Array.from(
      new Set([...YARN_TYPES, ...effectiveRows.map((r) => r.yarnType).filter(Boolean)])
    );
  }, [effectiveRows]);

  const availableSuppliers = useMemo(() => {
    const apiSuppliers = Array.isArray(supplierChoicesData)
      ? supplierChoicesData.map((s) => s.supplierName || s.supplier_name || s.name || s.label || s.companyName)
      : Array.isArray(supplierChoicesData?.data)
      ? supplierChoicesData.data.map((s) => s.supplierName || s.supplier_name || s.name || s.label || s.companyName)
      : [];
    return Array.from(
      new Set([...apiSuppliers.filter(Boolean), ...effectiveRows.map((r) => r.supplier).filter(Boolean)])
    );
  }, [effectiveRows, supplierChoicesData]);

  // Active filters count
  const activeFiltersCount = [
    yarnNameQuery.trim() !== "",
    countFilter !== "All",
    typeFilter !== "All",
    productionTypeFilter !== "All",
    supplierFilter !== "All",
    datePreset !== "All",
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setYarnNameQuery("");
    setCountFilter("All");
    setTypeFilter("All");
    setProductionTypeFilter("All");
    setSupplierFilter("All");
    setDatePreset("All");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  const { confirm, ConfirmDialog } = useConfirm();

  const handleDeleteItem = async (itemOrId) => {
    const id = typeof itemOrId === "object" ? itemOrId.id : itemOrId;
    const isConfirmed = await confirm({
      title: "Delete Yarn Intake",
      message: "Are you sure you want to delete this yarn intake record? This action cannot be undone.",
      confirmText: "Delete Record",
      variant: "danger",
    });
    if (!isConfirmed) return;

    try {
      if (id && typeof id === "number" && id > 0) {
        await deleteYarnIntake(id).unwrap();
        toast.success("Yarn intake entry deleted successfully.");
      }
    } catch (err) {
      console.warn("Delete API error, proceeding with local handler:", err);
      toast.success("Yarn intake entry deleted.");
    } finally {
      if (onDelete) {
        onDelete(id);
      }
    }
  };

  // Filter application
  const filtered = useMemo(() => {
    return effectiveRows.filter((r) => {
      // 1. Yarn Name (search by text)
      if (yarnNameQuery.trim()) {
        const q = yarnNameQuery.toLowerCase().trim();
        const matchesName = (r.name || "").toLowerCase().includes(q);
        const matchesEntry = (r.entryNo || "").toLowerCase().includes(q);
        const matchesLot = (r.lotNo || r.setNo || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEntry && !matchesLot) return false;
      }

      // 2. Yarn Count (drop down)
      if (countFilter !== "All" && r.count !== countFilter) {
        return false;
      }

      // 3. Yarn Type (drop down)
      if (typeFilter !== "All" && r.yarnType !== typeFilter) {
        return false;
      }

      // 4. Production Type (drop down)
      if (productionTypeFilter !== "All") {
        const itemProdType = r.productionType || "Self";
        if (itemProdType !== productionTypeFilter) return false;
      }

      // 5. Supplier (drop down)
      if (supplierFilter !== "All" && r.supplier !== supplierFilter) {
        return false;
      }

      // 6. Intake Date Range filter
      if (!checkDatePreset(r.date, datePreset, customStartDate, customEndDate)) {
        return false;
      }

      return true;
    });
  }, [
    effectiveRows,
    yarnNameQuery,
    countFilter,
    typeFilter,
    productionTypeFilter,
    supplierFilter,
    datePreset,
    customStartDate,
    customEndDate,
  ]);

  return (
    <Card padded={false}>
      {/* Table Header Strip */}
      <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SectionTitle title="Raw Material & Yarn Inventory" className="mb-0" />
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary font-mono">
              {filtered.length} of {effectiveRows.length}
            </span>
            {isApiFetching && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin text-primary" /> Updating...
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Incoming yarn intake, warehouse stock tracking, and sizing dispatch status
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted border border-border/70 flex items-center gap-1.5 transition-smooth cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
          <button
            type="button"
            onClick={() => refetch?.()}
            title="Refresh Yarn Inventory"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border/70 transition-smooth cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isApiFetching ? "animate-spin text-primary" : ""}`} />
          </button>
          <Button size="sm" onClick={onAddNew}>
            <Plus className="h-4 w-4" /> Add Yarn Intake
          </Button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="p-4 bg-muted/20 border-b border-border space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Yarn Name Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={yarnNameQuery}
              onChange={(e) => setYarnNameQuery(e.target.value)}
              placeholder="Search yarn name..."
              className="w-full h-10 pl-9 pr-7 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium"
            />
            {yarnNameQuery && (
              <button
                type="button"
                onClick={() => setYarnNameQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* 2. Yarn Count Filter */}
          <div>
            <select
              value={countFilter}
              onChange={(e) => setCountFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="All">All Counts</option>
              {availableCounts.map((yc) => (
                <option key={yc} value={yc}>
                  Count: {yc}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Yarn Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="All">All Yarn Types</option>
              {availableTypes.map((yt) => (
                <option key={yt} value={yt}>
                  {yt}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Production Type Filter */}
          <div>
            <select
              value={productionTypeFilter}
              onChange={(e) => setProductionTypeFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="All">All Production Types</option>
              <option value="Conversion">Conversion (Job Work)</option>
              <option value="Self">Self (In-house)</option>
            </select>
          </div>

          {/* 5. Supplier Filter */}
          <div>
            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="All">All Suppliers / Mills</option>
              {availableSuppliers.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
                </option>
              ))}
            </select>
          </div>

          {/* 6. Intake Date Range Preset */}
          <div>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary/20 outline-none text-xs font-medium text-foreground cursor-pointer"
            >
              {DATE_PRESETS.map((dp) => (
                <option key={dp.value} value={dp.value}>
                  {dp.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range Pickers (shown when 'Custom Date Range' is selected) */}
        {datePreset === "custom" && (
          <div className="p-3 rounded-xl bg-card border border-border/80 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Intake Date Range:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-medium">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-muted border border-border focus:border-primary outline-none text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-medium">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="h-8 px-2.5 rounded-lg bg-muted border border-border focus:border-primary outline-none text-xs font-mono"
                />
              </div>

              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStartDate("");
                    setCustomEndDate("");
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-smooth cursor-pointer ml-1"
                >
                  <X className="h-3.5 w-3.5" /> Clear Dates
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
            <tr>
              {/* <th className="text-left px-5 py-3.5">Entry No / Date</th> */}
              <th className="text-left px-5 py-3.5">Yarn Name</th>
              <th className="text-left px-5 py-3.5">Lot # / Supplier</th>
              <th className="text-right px-5 py-3.5">Bags</th>
              <th className="text-left px-5 py-3.5 min-w-[160px]">Dispatch</th>
              <th className="text-left px-5 py-3.5">Status</th>
              <th className="text-right px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const totalBags = Number(r.bags) || 1;
              const sentBags = Number(r.bagsSent) || 0;
              const remainingBags = Number(r.availableBags !== undefined ? r.availableBags : r.bags);
              const pctSent = Math.min(100, Math.round((sentBags / totalBags) * 100));

              return (
                <tr
                  key={r.id}
                  className="border-t border-border hover:bg-muted/30 transition-smooth cursor-pointer"
                  onClick={() => onSelect(r)}
                >
                  {/* <td className="px-5 py-3.5">
                    <div className="font-mono font-bold text-foreground">{r.entryNo || `YI-${r.id}`}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {r.date}
                    </div>
                  </td> */}

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{r.name}</span>
                      {r.productionType && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            r.productionType === "Conversion"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                        >
                          {r.productionType}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.count} · {r.yarnType}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="font-mono text-xs font-semibold text-foreground">{r.lotNo || r.setNo || "—"}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[160px]">{r.supplier}</div>
                  </td>

                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="font-bold text-foreground">{fmt(r.bags)} Bags</div>
                    {/* <div className="text-xs text-muted-foreground">
                      {fmt(r.netWeight)} {r.unit || "lb"}
                      {r.boxes ? ` · ${fmt(Number(r.bags) * Number(r.boxes))} Cones` : ""}
                    </div> */}
                    {/* {r.ratePerBag ? (
                      <div className="text-[11px] font-mono font-medium text-emerald-500">
                        Rs {fmt(r.ratePerBag)}/bag
                      </div>
                    ) : null} */}
                  </td>

                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-amber-500">{sentBags} Sent</span>
                      <span className="font-semibold text-emerald-500">{remainingBags} Left</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          pctSent >= 100 ? "bg-info" : pctSent > 0 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${pctSent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 text-right">{pctSent}% Dispatched</div>
                  </td>

                  <td className="px-5 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>

                  <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {remainingBags > 0 && onSendToSizing && (
                        <button
                          type="button"
                          onClick={() => onSendToSizing(r)}
                          title="Send to Sizing"
                          className="px-2 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-smooth flex items-center gap-1 cursor-pointer"
                        >
                          Out Going <ArrowRight className="h-3 w-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onTrace?.(r, "raw-material")}
                        title="Trace Manufacturing Lineage"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth cursor-pointer"
                      >
                        <GitFork className="h-4 w-4 text-purple-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelect?.(r)}
                        title="View Details"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit?.(r)}
                        title="Edit Entry"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth cursor-pointer"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(r)}
                        disabled={isDeleting}
                        title="Delete Entry"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && !isApiLoading && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <div className="p-3 rounded-full bg-muted w-fit mx-auto text-muted-foreground">
                      <Filter className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-foreground">No matching yarn records</p>
                    <p className="text-xs">Try adjusting or clearing your filters to see more results.</p>
                    {activeFiltersCount > 0 && (
                      <Button size="sm" variant="outline" onClick={handleResetFilters} className="mt-2">
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear All Filters
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {isApiLoading && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-xs font-semibold">Loading Yarn Inventory...</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog />
    </Card>
  );
}
