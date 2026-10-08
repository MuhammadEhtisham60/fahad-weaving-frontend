import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus, Search, RefreshCw, Eye, Edit, Trash2, Building, Building2,
  Users, CheckCircle2, XCircle, AlertOctagon, CreditCard, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, Card, StatusBadge, Button } from "../../components/ui-kit.jsx";
import {
  useGetSupplierStatsQuery,
  useGetSupplierChoicesQuery,
  useGetSuppliersQuery,
  useDeleteSupplierMutation,
} from "../../store/index.js";
import { SupplierModal } from "./components/SupplierModal.jsx";
import { SupplierViewModal } from "./components/SupplierViewModal.jsx";
import { SupplierDeleteModal } from "./components/SupplierDeleteModal.jsx";

export const Route = createFileRoute("/purchase/supplier")({
  component: SupplierManagementPage,
});

function SupplierManagementPage() {
  // Query Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [supplierType, setSupplierType] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [viewSupplierId, setViewSupplierId] = useState(null);
  const [deleteSupplierTarget, setDeleteSupplierTarget] = useState(null);

  // Queries
  const { data: statsData, isLoading: statsLoading } = useGetSupplierStatsQuery();
  const { data: choicesData } = useGetSupplierChoicesQuery();
  const {
    data: paginatedData,
    isLoading: listLoading,
    isFetching,
    refetch,
  } = useGetSuppliersQuery({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    status: status || undefined,
    supplier_type: supplierType || undefined,
    ordering,
  });

  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();

  // Handlers
  const handleDeleteConfirm = async () => {
    if (!deleteSupplierTarget) return;
    try {
      await deleteSupplier(deleteSupplierTarget.id).unwrap();
      toast.success("Supplier deleted successfully");
      setDeleteSupplierTarget(null);
    } catch {
      // global error handler handles toasts
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setSupplierType("");
    setOrdering("-created_at");
    setPage(1);
  };

  const suppliers = paginatedData?.results || [];
  const totalCount = paginatedData?.count || 0;
  const totalPages = paginatedData?.totalPages || 1;

  const supplierTypeChoices = choicesData?.supplierTypes || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Suppliers"
        subtitle="Manage vendor profiles, material categories, and registered bank accounts"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
              title="Refresh supplier list"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Add Supplier
            </Button>
          </div>
        }
      />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Suppliers"
          value={statsLoading ? "..." : statsData?.totalSuppliers ?? 0}
          icon={Building2}
          gradient="primary"
        />
        <StatCard
          label="Active Vendors"
          value={statsLoading ? "..." : statsData?.byStatus?.Active ?? 0}
          icon={CheckCircle2}
          gradient="success"
        />
        <StatCard
          label="Inactive Vendors"
          value={statsLoading ? "..." : statsData?.byStatus?.Inactive ?? 0}
          icon={XCircle}
          gradient="warning"
        />
        <StatCard
          label="Blocked Vendors"
          value={statsLoading ? "..." : statsData?.byStatus?.Blocked ?? 0}
          icon={AlertOctagon}
          gradient="info"
        />
      </div>

      {/* Filter and Controls Card */}
      <Card padded={false}>
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, code, phone, email..."
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>

            {/* Supplier Type Filter */}
            <select
              value={supplierType}
              onChange={(e) => {
                setSupplierType(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full sm:w-44 px-3 rounded-lg bg-background border border-border text-xs font-medium focus:border-ring outline-none cursor-pointer"
            >
              <option value="">All Supplier Types</option>
              {supplierTypeChoices.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Ordering Filter */}
            <select
              value={ordering}
              onChange={(e) => {
                setOrdering(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full sm:w-44 px-3 rounded-lg bg-background border border-border text-xs font-medium focus:border-ring outline-none cursor-pointer"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="supplier_name">Name (A-Z)</option>
              <option value="-supplier_name">Name (Z-A)</option>
              <option value="status">Status</option>
            </select>

            {(search || status || supplierType || ordering !== "-created_at") && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-xs text-muted-foreground whitespace-nowrap font-medium">
            Showing {suppliers.length} of {totalCount} suppliers
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3">Supplier</th>
                <th className="px-5 py-3">Company</th>
                {/* <th className="px-5 py-3">Contact Person</th> */}
                <th className="px-5 py-3">Phone & Email</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                {/* <th className="px-5 py-3 text-center">Bank Accounts</th> */}
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {listLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs font-medium">Loading suppliers...</span>
                    </div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-semibold text-foreground">No suppliers found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search filters or click &quot;Add Supplier&quot; to create one.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                suppliers.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Code & Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {item.supplierName?.slice(0, 2)?.toUpperCase() || "SU"}
                        </div> */}
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {item.supplierName}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground">
                            {item.supplierCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Company Name */}
                    <td className="px-5 py-3.5 text-xs text-foreground font-medium">
                      {item.companyName || "—"}
                    </td>

                    {/* Contact Person */}
                    {/* <td className="px-5 py-3.5 text-xs text-foreground font-medium">
                      {item.contactPerson}
                    </td> */}

                    {/* Phone & Email */}
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-semibold text-foreground">{item.phone}</div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                        {item.email || "—"}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-muted text-foreground text-xs font-medium border border-border">
                        {item.supplierType || "General"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={item.status || "Active"} />
                    </td>

                    {/* Bank Account Count */}
                    {/* <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        <CreditCard className="h-3 w-3" />
                        {item.bankAccountCount ?? (item.bankAccounts?.length || 0)}
                      </span>
                    </td> */}

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewSupplierId(item.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditSupplierId(item.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteSupplierTarget(item)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete Supplier"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
      {addModalOpen && <SupplierModal onClose={() => setAddModalOpen(false)} />}

      {editSupplierId && (
        <SupplierModal
          supplierId={editSupplierId}
          onClose={() => setEditSupplierId(null)}
        />
      )}

      {viewSupplierId && (
        <SupplierViewModal
          supplierId={viewSupplierId}
          onClose={() => setViewSupplierId(null)}
        />
      )}

      {deleteSupplierTarget && (
        <SupplierDeleteModal
          supplierName={deleteSupplierTarget.supplierName}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteSupplierTarget(null)}
        />
      )}
    </div>
  );
}
