import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus, RefreshCw, Eye, Edit, Trash2, Factory, CheckCircle2,
  Sliders, XCircle, ChevronLeft, ChevronRight, Loader2, Phone, Mail, MapPin
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, Card, StatusBadge, Button } from "../../../components/ui-kit.jsx";
import {
  useGetSizingsQuery,
  useDeleteSizingMutation,
} from "../../../store/index.js";
import { useAuth } from "../../../hooks/useAuth.js";
import { SearchField, SelectField } from "../../../common/sharefield";
import { SizingModal } from "./components/SizingModal.jsx";
import { SizingViewModal } from "./components/SizingViewModal.jsx";
import { SizingDeleteModal } from "./components/SizingDeleteModal.jsx";
import { SizingStatusModal } from "./components/SizingStatusModal.jsx";

export const Route = createFileRoute("/production/sizing/")({
  component: SizingManagementPage,
});

function SizingManagementPage() {
  const { hasPermission } = useAuth();

  // Query Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editSizingId, setEditSizingId] = useState(null);
  const [viewSizingId, setViewSizingId] = useState(null);
  const [deleteSizingTarget, setDeleteSizingTarget] = useState(null);
  const [statusSizingTarget, setStatusSizingTarget] = useState(null);

  // Queries
  const {
    data: paginatedData,
    isLoading: listLoading,
    isFetching,
    refetch,
  } = useGetSizingsQuery({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    status: status || undefined,
    ordering,
  });

  const [deleteSizing, { isLoading: isDeleting }] = useDeleteSizingMutation();

  // Handlers
  const handleDeleteConfirm = async () => {
    if (!deleteSizingTarget) return;
    try {
      await deleteSizing(deleteSizingTarget.id).unwrap();
      toast.success("Sizing unit deleted successfully.");
      setDeleteSizingTarget(null);
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

  const sizings = paginatedData?.results || [];
  const totalCount = paginatedData?.count || 0;
  const totalPages = paginatedData?.totalPages || 1;

  // Derive counts from paginated or active list
  const activeCount = sizings.filter((s) => s.status === "Active").length;
  const inactiveCount = sizings.filter((s) => s.status === "Inactive").length;

  const canAdd = hasPermission("sizing.add") || hasPermission("sizings.add");
  const canEdit = hasPermission("sizing.edit") || hasPermission("sizing.change") || hasPermission("sizings.edit");
  const canDelete = hasPermission("sizing.delete") || hasPermission("sizings.delete");

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Sizing Units"
        subtitle="Manage warp sizing mills, partner facilities, contact records, and operational statuses"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
              title="Refresh sizing list"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
            {canAdd && (
              <Button
                size="sm"
                className="text-xs"
                onClick={() => setAddModalOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" /> Add Sizing Unit
              </Button>
            )}
          </div>
        }
      />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Sizing Units"
          value={listLoading ? "..." : totalCount}
          icon={Factory}
          gradient="primary"
        />
        <StatCard
          label="Active Facilities"
          value={listLoading ? "..." : (status === "Active" ? totalCount : activeCount)}
          hint="Operational sizing mills"
          icon={CheckCircle2}
          gradient="success"
        />
        <StatCard
          label="Inactive / Paused"
          value={listLoading ? "..." : (status === "Inactive" ? totalCount : inactiveCount)}
          hint="Paused contract units"
          icon={XCircle}
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
                placeholder="Search name, person, phone, email, address..."
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
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
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
                  { value: "sizing_name", label: "Name (A-Z)" },
                  { value: "-sizing_name", label: "Name (Z-A)" },
                  { value: "status", label: "Status" },
                  { value: "-updated_at", label: "Recently Updated" },
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
            Showing {sizings.length} of {totalCount} sizing units
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3">Sizing Unit Name</th>
                <th className="px-5 py-3">Contact Person</th>
                <th className="px-5 py-3">Phone & Email</th>
                <th className="px-5 py-3">Address</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs font-medium">Loading sizing units...</span>
                    </div>
                  </td>
                </tr>
              ) : sizings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Factory className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-semibold text-foreground">No sizing units found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search filters or click &quot;Add Sizing Unit&quot; to register a new unit.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sizings.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Unit Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                          {item.sizingName?.slice(0, 2)?.toUpperCase() || "SZ"}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {item.sizingName}
                          </div>
                          {item.notes && (
                            <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
                              {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact Person */}
                    <td className="px-5 py-3.5 text-xs text-foreground font-medium">
                      {item.contactPerson || "—"}
                    </td>

                    {/* Phone & Email */}
                    <td className="px-5 py-3.5 text-xs text-foreground">
                      {(item.contactNumber || item.phoneNo) ? (
                        <div className="font-mono font-medium flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {item.contactNumber || item.phoneNo}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {item.email && (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {item.email}
                        </div>
                      )}
                    </td>

                    {/* Address */}
                    <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-xs truncate">
                      {item.address ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{item.address}</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status || "Active"} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewSizingId(item.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => setStatusSizingTarget(item)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                              title="Change Status"
                            >
                              <Sliders className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditSizingId(item.id)}
                              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                              title="Edit Sizing Unit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteSizingTarget(item)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                            title="Delete Sizing Unit"
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
      {addModalOpen && <SizingModal onClose={() => setAddModalOpen(false)} />}

      {editSizingId && (
        <SizingModal
          sizingId={editSizingId}
          onClose={() => setEditSizingId(null)}
        />
      )}

      {viewSizingId && (
        <SizingViewModal
          sizingId={viewSizingId}
          onClose={() => setViewSizingId(null)}
          onEdit={(id) => setEditSizingId(id)}
        />
      )}

      {statusSizingTarget && (
        <SizingStatusModal
          sizing={statusSizingTarget}
          onClose={() => setStatusSizingTarget(null)}
        />
      )}

      {deleteSizingTarget && (
        <SizingDeleteModal
          sizingName={deleteSizingTarget.sizingName}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteSizingTarget(null)}
        />
      )}
    </div>
  );
}
