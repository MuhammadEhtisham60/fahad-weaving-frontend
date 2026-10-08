import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus, Search, RefreshCw, Eye, Edit, Trash2, Cpu, CheckCircle2,
  Sliders, Play, Wrench, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, Card, StatusBadge, Button } from "../../../components/ui-kit.jsx";
import {
  useGetLoomStatsQuery,
  useGetLoomChoicesQuery,
  useGetLoomsQuery,
  useDeleteLoomMutation,
} from "../../../store/index.js";
import { useAuth } from "../../../hooks/useAuth.js";
import { LoomModal } from "./components/LoomModal.jsx";
import { LoomViewModal } from "./components/LoomViewModal.jsx";
import { LoomDeleteModal } from "./components/LoomDeleteModal.jsx";
import { LoomStatusModal } from "./components/LoomStatusModal.jsx";

export const Route = createFileRoute("/production/loom/")({
  component: LoomManagementPage,
});

function LoomManagementPage() {
  const { hasPermission } = useAuth();

  // Query Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editLoomId, setEditLoomId] = useState(null);
  const [viewLoomId, setViewLoomId] = useState(null);
  const [deleteLoomTarget, setDeleteLoomTarget] = useState(null);
  const [statusLoomTarget, setStatusLoomTarget] = useState(null);

  // Queries
  const { data: statsData, isLoading: statsLoading } = useGetLoomStatsQuery();
  const { data: choicesData } = useGetLoomChoicesQuery();
  const {
    data: paginatedData,
    isLoading: listLoading,
    isFetching,
    refetch,
  } = useGetLoomsQuery({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    status: status || undefined,
    location: location.trim() || undefined,
    ordering,
  });

  const [deleteLoom, { isLoading: isDeleting }] = useDeleteLoomMutation();

  // Handlers
  const handleDeleteConfirm = async () => {
    if (!deleteLoomTarget) return;
    try {
      await deleteLoom(deleteLoomTarget.id).unwrap();
      toast.success("Loom deleted successfully.");
      setDeleteLoomTarget(null);
    } catch {
      // Global error handler handles toast
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setLocation("");
    setOrdering("-created_at");
    setPage(1);
  };

  const looms = paginatedData?.results || [];
  const totalCount = paginatedData?.count || 0;
  const totalPages = paginatedData?.totalPages || 1;

  const statusChoices = choicesData?.statusChoices || [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Sizing", label: "Sizing" },
    { value: "Production", label: "Production" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Breakdown", label: "Breakdown" },
  ];

  const canAdd = hasPermission("looms.add");
  const canChange = hasPermission("looms.change");
  const canDelete = hasPermission("looms.delete");

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Looms"
        subtitle="Manage weaving machine units, technical specifications, and operating status"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
              title="Refresh loom list"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
            {canAdd && (
              <Button
                size="sm"
                className="text-xs"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" /> Add Loom
              </Button>
            )}
          </div>
        }
      />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Looms"
          value={statsLoading ? "..." : statsData?.totalLooms ?? 0}
          icon={Cpu}
          gradient="primary"
        />
        <StatCard
          label="Active Looms"
          value={statsLoading ? "..." : statsData?.byStatus?.Active ?? 0}
          icon={CheckCircle2}
          gradient="success"
        />
        <StatCard
          label="In Production"
          value={statsLoading ? "..." : statsData?.byStatus?.Production ?? 0}
          icon={Play}
          gradient="info"
        />
        <StatCard
          label="Maintenance / Breakdown"
          value={
            statsLoading
              ? "..."
              : (statsData?.byStatus?.Maintenance ?? 0) + (statsData?.byStatus?.Breakdown ?? 0)
          }
          icon={Wrench}
          gradient="warning"
        />
      </div>

      {/* Filter and Controls Card */}
      <Card padded={false}>
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
          <div className="flex-1 flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search code, name, model no., location..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-xs focus:border-ring outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full sm:w-40 px-3 rounded-lg bg-background border border-border text-xs font-medium focus:border-ring outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              {statusChoices.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Location Filter */}
            <div className="w-full sm:w-40">
              <input
                type="text"
                placeholder="Location / Hall..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 px-3 rounded-lg bg-background border border-border text-xs focus:border-ring outline-none"
              />
            </div>

            {/* Ordering Filter */}
            <select
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full sm:w-48 px-3 rounded-lg bg-background border border-border text-xs font-medium focus:border-ring outline-none cursor-pointer"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="loom_code">Loom Code (A-Z)</option>
              <option value="-loom_code">Loom Code (Z-A)</option>
              <option value="loom_name">Loom Name (A-Z)</option>
              <option value="-loom_name">Loom Name (Z-A)</option>
              <option value="status">Status</option>
              <option value="location">Location</option>
              <option value="-installation_date">Installation (Recent First)</option>
              <option value="installation_date">Installation (Oldest First)</option>
            </select>

            {(search || status || location || ordering !== "-created_at") && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-xs text-muted-foreground whitespace-nowrap font-medium">
            Showing {looms.length} of {totalCount} looms
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3">Loom Code & Name</th>
                <th className="px-5 py-3">Model Number</th>
                <th className="px-5 py-3">Width (cm)</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Installation Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs font-medium">Loading looms...</span>
                    </div>
                  </td>
                </tr>
              ) : looms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Cpu className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-semibold text-foreground">No looms found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search filters or click &quot;Add Loom&quot; to register a machine.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                looms.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Code & Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          {item.loomCode?.slice(0, 3) || "LM"}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {item.loomName}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground">
                            {item.loomCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Model Number */}
                    <td className="px-5 py-3.5 text-xs text-foreground font-medium">
                      {item.modelNumber || "—"}
                    </td>

                    {/* Width (cm) */}
                    <td className="px-5 py-3.5 text-xs text-foreground font-medium">
                      {item.width != null ? `${item.width} cm` : "—"}
                    </td>

                    {/* Location */}
                    <td className="px-5 py-3.5 text-xs text-foreground font-medium">
                      {item.location || "—"}
                    </td>

                    {/* Installation Date */}
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {item.installationDate || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status || "Active"} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewLoomId(item.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canChange && (
                          <>
                            <button
                              onClick={() => setStatusLoomTarget(item)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                              title="Change Status"
                            >
                              <Sliders className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditLoomId(item.id)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                              title="Edit Loom"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteLoomTarget(item)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete Loom"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <div className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-semibold hover:bg-muted disabled:opacity-40 transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      {addModalOpen && <LoomModal onClose={() => setAddModalOpen(false)} />}

      {editLoomId && (
        <LoomModal
          loomId={editLoomId}
          onClose={() => setEditLoomId(null)}
        />
      )}

      {viewLoomId && (
        <LoomViewModal
          loomId={viewLoomId}
          onClose={() => setViewLoomId(null)}
          onEdit={(id) => setEditLoomId(id)}
        />
      )}

      {statusLoomTarget && (
        <LoomStatusModal
          loom={statusLoomTarget}
          onClose={() => setStatusLoomTarget(null)}
        />
      )}

      {deleteLoomTarget && (
        <LoomDeleteModal
          loomCode={deleteLoomTarget.loomCode}
          loomName={deleteLoomTarget.loomName}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteLoomTarget(null)}
        />
      )}
    </div>
  );
}
