import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus, RefreshCw, Eye, Edit, Trash2, Layers, CheckCircle2,
  Sliders, Play, ChevronLeft, ChevronRight, Loader2, Disc
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, Card, StatusBadge, Button } from "../../../components/ui-kit.jsx";
import {
  useGetBeamStatsQuery,
  useGetBeamChoicesQuery,
  useGetBeamsQuery,
  useDeleteBeamMutation,
} from "../../../store/index.js";
import { useAuth } from "../../../hooks/useAuth.js";
import { SearchField, SelectField } from "../../../common/sharefield";
import { BeamModal } from "./components/BeamModal.jsx";
import { BeamViewModal } from "./components/BeamViewModal.jsx";
import { BeamDeleteModal } from "./components/BeamDeleteModal.jsx";
import { BeamStatusModal } from "./components/BeamStatusModal.jsx";

export const Route = createFileRoute("/production/beam/")({
  component: BeamManagementPage,
});

function BeamManagementPage() {
  const { hasPermission } = useAuth();

  // Query Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editBeamId, setEditBeamId] = useState(null);
  const [viewBeamId, setViewBeamId] = useState(null);
  const [deleteBeamTarget, setDeleteBeamTarget] = useState(null);
  const [statusBeamTarget, setStatusBeamTarget] = useState(null);

  // Queries
  const { data: statsData, isLoading: statsLoading } = useGetBeamStatsQuery();
  const { data: choicesData } = useGetBeamChoicesQuery();
  const {
    data: paginatedData,
    isLoading: listLoading,
    isFetching,
    refetch,
  } = useGetBeamsQuery({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    status: status || undefined,
    ordering,
  });

  const [deleteBeam, { isLoading: isDeleting }] = useDeleteBeamMutation();

  // Handlers
  const handleDeleteConfirm = async () => {
    if (!deleteBeamTarget) return;
    try {
      await deleteBeam(deleteBeamTarget.id).unwrap();
      toast.success("Beam deleted successfully.");
      setDeleteBeamTarget(null);
    } catch {
      // Global error handler handles toast
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setOrdering("-created_at");
    setPage(1);
  };

  const beams = paginatedData?.results || [];
  const totalCount = paginatedData?.count || 0;
  const totalPages = paginatedData?.totalPages || 1;

  const statusChoices = choicesData?.statusChoices || [
    { value: "Available", label: "Available" },
    { value: "Sizing", label: "Sizing" },
    { value: "Loaded", label: "Loaded" },
    { value: "In Production", label: "In Production" },
    { value: "Completed", label: "Completed" },
    { value: "Damaged", label: "Damaged" },
    { value: "Inactive", label: "Inactive" },
  ];

  const canAdd = hasPermission("beams.add");
  const canChange = hasPermission("beams.change");
  const canDelete = hasPermission("beams.delete");

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Beams"
        subtitle="Manage warp beams, sizing entries, and loom allocation specifications"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
              title="Refresh beam list"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
            {canAdd && (
              <Button
                size="sm"
                className="text-xs"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" /> Add Beam
              </Button>
            )}
          </div>
        }
      />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Beams"
          value={statsLoading ? "..." : statsData?.totalBeams ?? 0}
          icon={Layers}
          gradient="primary"
        />
        <StatCard
          label="Available Beams"
          value={statsLoading ? "..." : statsData?.byStatus?.Available ?? 0}
          icon={CheckCircle2}
          gradient="success"
        />
        <StatCard
          label="In Production"
          value={statsLoading ? "..." : statsData?.byStatus?.["In Production"] ?? 0}
          icon={Play}
          gradient="info"
        />
        <StatCard
          label="In Sizing / Loaded"
          value={
            statsLoading
              ? "..."
              : (statsData?.byStatus?.Sizing ?? 0) + (statsData?.byStatus?.Loaded ?? 0)
          }
          icon={Disc}
          gradient="warning"
        />
      </div>

      {/* Filter and Controls Card */}
      <Card padded={false}>
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
          <div className="flex-1 flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="w-full sm:w-64">
              <SearchField
                placeholder="Search beam number or name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                onClear={() => {
                  setSearch("");
                  setPage(1);
                }}
                size="sm"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full sm:w-40">
              <SelectField
                name="statusFilter"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                placeholder="All Statuses"
                options={[
                  { value: "", label: "All Statuses" },
                  ...statusChoices,
                ]}
                size="sm"
              />
            </div>

            {/* Ordering Filter */}
            <div className="w-full sm:w-48">
              <SelectField
                name="orderingFilter"
                value={ordering}
                onChange={(e) => {
                  setOrdering(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: "-created_at", label: "Newest First" },
                  { value: "created_at", label: "Oldest First" },
                  { value: "beam_number", label: "Beam Number (A-Z)" },
                  { value: "-beam_number", label: "Beam Number (Z-A)" },
                  { value: "status", label: "Status" },
                  { value: "-length", label: "Length (High to Low)" },
                  { value: "length", label: "Length (Low to High)" },
                  { value: "-weight", label: "Weight (High to Low)" },
                ]}
                size="sm"
              />
            </div>

            {(search || status || ordering !== "-created_at") && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-xs text-muted-foreground whitespace-nowrap font-medium">
            Showing {beams.length} of {totalCount} beams
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3">Beam Number</th>
                <th className="px-5 py-3">Beam Name</th>
                <th className="px-5 py-3">Length & Weight</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs font-medium">Loading beams...</span>
                    </div>
                  </td>
                </tr>
              ) : beams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-semibold text-foreground">No beams found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search filters or click &quot;Add Beam&quot; to register a new beam.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                beams.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Beam Number */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          {item.beamNumber?.slice(0, 3) || "BM"}
                        </div>
                        <div className="font-semibold text-foreground font-mono">
                          {item.beamNumber}
                        </div>
                      </div>
                    </td>

                    {/* Beam Name */}
                    <td className="px-5 py-3.5 text-xs text-foreground font-medium">
                      {item.beamName || "—"}
                    </td>

                    {/* Length & Weight */}
                    <td className="px-5 py-3.5 text-xs text-foreground">
                      <div className="font-medium">{item.length != null ? `${item.length} m` : "—"}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.weight != null ? `${item.weight} kg` : ""}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status || "Available"} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewBeamId(item.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canChange && (
                          <>
                            <button
                              onClick={() => setStatusBeamTarget(item)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                              title="Change Status"
                            >
                              <Sliders className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditBeamId(item.id)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                              title="Edit Beam"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteBeamTarget(item)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete Beam"
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
      {addModalOpen && <BeamModal onClose={() => setAddModalOpen(false)} />}

      {editBeamId && (
        <BeamModal
          beamId={editBeamId}
          onClose={() => setEditBeamId(null)}
        />
      )}

      {viewBeamId && (
        <BeamViewModal
          beamId={viewBeamId}
          onClose={() => setViewBeamId(null)}
          onEdit={(id) => setEditBeamId(id)}
        />
      )}

      {statusBeamTarget && (
        <BeamStatusModal
          beam={statusBeamTarget}
          onClose={() => setStatusBeamTarget(null)}
        />
      )}

      {deleteBeamTarget && (
        <BeamDeleteModal
          beamNumber={deleteBeamTarget.beamNumber}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteBeamTarget(null)}
        />
      )}
    </div>
  );
}

