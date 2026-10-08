import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Plus, Search, RefreshCw, Eye, Edit, Trash2, Users, CheckCircle2,
  XCircle, AlertOctagon, CreditCard, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, StatCard, Card, StatusBadge, Button } from "../../components/ui-kit.jsx";
import {
  useGetCustomerStatsQuery,
  useGetCustomerChoicesQuery,
  useGetCustomersQuery,
  useDeleteCustomerMutation,
} from "../../store/index.js";
import { CustomerModal } from "./components/CustomerModal.jsx";
import { CustomerViewModal } from "./components/CustomerViewModal.jsx";
import { CustomerDeleteModal } from "./components/CustomerDeleteModal.jsx";

export const Route = createFileRoute("/sale/customer")({
  component: CustomerManagementPage,
});

function CustomerManagementPage() {
  // Query Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState(null);
  const [viewCustomerId, setViewCustomerId] = useState(null);
  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState(null);

  // Queries
  const { data: statsData, isLoading: statsLoading } = useGetCustomerStatsQuery();
  const { data: choicesData } = useGetCustomerChoicesQuery();
  const {
    data: paginatedData,
    isLoading: listLoading,
    isFetching,
    refetch,
  } = useGetCustomersQuery({
    page,
    page_size: pageSize,
    search: search.trim() || undefined,
    status: status || undefined,
    customer_type: customerType || undefined,
    ordering,
  });

  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  // Handlers
  const handleDeleteConfirm = async () => {
    if (!deleteCustomerTarget) return;
    try {
      await deleteCustomer(deleteCustomerTarget.id).unwrap();
      toast.success("Customer deleted successfully");
      setDeleteCustomerTarget(null);
    } catch {
      // global error handler handles toasts
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatus("");
    setCustomerType("");
    setOrdering("-created_at");
    setPage(1);
  };

  const customers = paginatedData?.results || [];
  const totalCount = paginatedData?.count || 0;
  const totalPages = paginatedData?.totalPages || 1;

  const customerTypeChoices = choicesData?.customerTypes || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <PageHeader
        title="Customers"
        subtitle="Manage buyers, fabric client accounts, and registered bank details"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
              title="Refresh customer list"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button
              size="sm"
              className="text-xs"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Add Customer
            </Button>
          </div>
        }
      />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Customers"
          value={statsLoading ? "..." : statsData?.totalCustomers ?? 0}
          icon={Users}
          gradient="primary"
        />
        <StatCard
          label="Active Clients"
          value={statsLoading ? "..." : statsData?.byStatus?.Active ?? 0}
          icon={CheckCircle2}
          gradient="success"
        />
        <StatCard
          label="Inactive Clients"
          value={statsLoading ? "..." : statsData?.byStatus?.Inactive ?? 0}
          icon={XCircle}
          gradient="warning"
        />
        <StatCard
          label="Blocked Clients"
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

            {/* Customer Type Filter */}
            <select
              value={customerType}
              onChange={(e) => {
                setCustomerType(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full sm:w-44 px-3 rounded-lg bg-background border border-border text-xs font-medium focus:border-ring outline-none cursor-pointer"
            >
              <option value="">All Customer Types</option>
              {customerTypeChoices.map((c) => (
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
              <option value="customer_name">Name (A-Z)</option>
              <option value="-customer_name">Name (Z-A)</option>
              <option value="status">Status</option>
            </select>

            {(search || status || customerType || ordering !== "-created_at") && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-xs text-muted-foreground whitespace-nowrap font-medium">
            Showing {customers.length} of {totalCount} customers
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="px-5 py-3">Customer</th>
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
                      <span className="text-xs font-medium">Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-semibold text-foreground">No customers found</p>
                      <p className="text-xs text-muted-foreground">
                        Try adjusting your search filters or click &quot;Add Customer&quot; to create one.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Code & Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {item.customerName?.slice(0, 2)?.toUpperCase() || "CU"}
                        </div> */}
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1.5">
                            {item.customerName}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground">
                            {item.customerCode}
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
                        {item.customerType || "Wholesaler"}
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
                          onClick={() => setViewCustomerId(item.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditCustomerId(item.id)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                          title="Edit Customer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteCustomerTarget(item)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete Customer"
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
      {addModalOpen && <CustomerModal onClose={() => setAddModalOpen(false)} />}

      {editCustomerId && (
        <CustomerModal
          customerId={editCustomerId}
          onClose={() => setEditCustomerId(null)}
        />
      )}

      {viewCustomerId && (
        <CustomerViewModal
          customerId={viewCustomerId}
          onClose={() => setViewCustomerId(null)}
        />
      )}

      {deleteCustomerTarget && (
        <CustomerDeleteModal
          customerName={deleteCustomerTarget.customerName}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteCustomerTarget(null)}
        />
      )}
    </div>
  );
}
