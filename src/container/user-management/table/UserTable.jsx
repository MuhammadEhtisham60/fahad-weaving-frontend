import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit2,
  Trash2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  RotateCcw,
  CheckSquare,
  Square,
  FileText,
  Grid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import { Button, StatusBadge } from "../../../components/ui-kit.jsx";
import { useConfirm } from "../../../common/popups/index.js";
import {
  COMPANIES,
  BRANCHES,
  DEPARTMENTS,
  ROLES_LIST,
  USER_STATUSES,
} from "../utils/constants.js";
import { downloadUsersPdf, downloadUserSummaryCsv } from "../utils/userPdfExport.js";
import { useTranslation } from "../../../context/LanguageContext.jsx";

export function UserTable({
  users = [],
  onViewUser,
  onEditUser,
  onDeleteUser,
  onToggleStatus,
  onResetPassword,
  onManagePermissions,
  onAddUser,
  initialStatusFilter = "all",
}) {
  const { t } = useTranslation();
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter === "all" ? "All" : initialStatusFilter);
  const [dateFilter, setDateFilter] = useState("");

  // View & Pagination
  const [viewMode, setViewMode] = useState("table"); // "table" or "grid"
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [sortField, setSortField] = useState("fullName");
  const [sortAsc, setSortAsc] = useState(true);

  // Active actions dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);



  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        u.username?.toLowerCase().includes(q) ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.employeeId?.toLowerCase().includes(q) ||
        u.designation?.toLowerCase().includes(q);

      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      const matchesDate = !dateFilter || (u.joiningDate && u.joiningDate >= dateFilter);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    users,
    searchQuery,
    roleFilter,
    statusFilter,
    dateFilter,
  ]);

  // Sorting
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortAsc]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setRoleFilter("All");
    setStatusFilter("All");
    setDateFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    roleFilter !== "All" ||
    statusFilter !== "All" ||
    dateFilter;

  // Bulk selection
  const handleSelectAll = () => {
    if (selectedUserIds.length === paginatedUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(paginatedUsers.map((u) => u.id));
    }
  };

  const handleToggleSelectUser = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((uid) => uid !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  // Bulk actions
  const handleBulkActivate = () => {
    selectedUserIds.forEach((id) => onToggleStatus && onToggleStatus(id, "Active"));
    setSelectedUserIds([]);
  };

  const handleBulkDeactivate = () => {
    selectedUserIds.forEach((id) => onToggleStatus && onToggleStatus(id, "Inactive"));
    setSelectedUserIds([]);
  };

  const { confirm, ConfirmDialog } = useConfirm();

  const handleBulkDelete = async () => {
    const isConfirmed = await confirm({
      title: "Delete Selected Users",
      message: `Are you sure you want to delete ${selectedUserIds.length} selected users? This action cannot be undone.`,
      confirmText: `Delete ${selectedUserIds.length} Users`,
      variant: "danger",
    });
    if (isConfirmed) {
      selectedUserIds.forEach((id) => onDeleteUser && onDeleteUser(id));
      setSelectedUserIds([]);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "Inactive":
        return "bg-muted text-muted-foreground border-border";
      case "Suspended":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "Pending":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "Super Admin":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Admin":
        return "bg-primary/15 text-primary border-primary/30";
      case "Production Manager":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
      case "Accountant":
        return "bg-amber-500/15 text-amber-600 border-amber-500/30";
      case "HR":
        return "bg-pink-500/15 text-pink-600 border-pink-500/30";
      case "Supervisor":
        return "bg-cyan-500/15 text-cyan-600 border-cyan-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Search Bar */}
      <div className="rounded-2xl bg-card border border-border p-4 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, @username, email, phone, employee ID..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs font-medium"
            />
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadUsersPdf(sortedUsers, statusFilter)}
              title="Export filtered records to PDF"
              className="text-xs"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadUserSummaryCsv(sortedUsers)}
              title="Export filtered records to CSV"
              className="text-xs"
            >
              <FileText className="h-3.5 w-3.5" /> CSV
            </Button>
            {/* {onAddUser && (
              <Button type="button" size="sm" onClick={onAddUser} className="text-xs">
                <Plus className="h-3.5 w-3.5" /> Add User
              </Button>
            )} */}

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-muted p-1 border border-border">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Table View"
              >
                <ListIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Card Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-3 border-t border-border/60 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
          {/* Role Filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs font-medium"
            >
              <option value="All">All Roles</option>
              {ROLES_LIST.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>



          {/* Status Filter */}
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-9 px-2.5 rounded-lg bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs font-medium"
            >
              <option value="All">All Statuses</option>
              {USER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className={`w-full h-9 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                hasActiveFilters
                  ? "bg-muted/80 hover:bg-muted text-foreground border-border"
                  : "bg-muted/30 text-muted-foreground border-transparent opacity-50 cursor-not-allowed"
              }`}
            >
              <RotateCcw className="h-3 w-3" /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Selection Action Strip */}
      {selectedUserIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-primary">
            <CheckSquare className="h-4 w-4" />
            <span>{selectedUserIds.length} users selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleBulkActivate} className="text-xs">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Activate
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkDeactivate} className="text-xs">
              <XCircle className="h-3 w-3 text-amber-500" /> Deactivate
            </Button>
            <Button size="sm" variant="danger" onClick={handleBulkDelete} className="text-xs">
              <Trash2 className="h-3 w-3" /> Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Main Table or Card Grid View */}
      {viewMode === "table" ? (
        <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 text-muted-foreground uppercase font-bold tracking-wider text-[10px] border-b border-border select-none">
                <tr>
                  <th className="p-3.5 w-10">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {selectedUserIds.length > 0 &&
                      selectedUserIds.length === paginatedUsers.length ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("fullName")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t("common.name", "User Name")}</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t("common.email", "Email")}</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="p-3.5 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t("common.role", "Role")}</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>

                  <th
                    className="p-3.5 cursor-pointer hover:text-foreground"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t("common.status", "Status")}</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>

                  <th className="p-3.5 text-right rtl:text-left">{t("common.actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectUser(user.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* User Name & Handle */}
                      <td className="p-3.5 whitespace-nowrap">
                        {/* <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onViewUser && onViewUser(user)}
                            className="font-bold text-foreground text-sm hover:text-primary transition-colors text-left truncate"
                          >
                            {user.fullName}
                          </button>
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {user.employeeId || user.id}
                          </span>
                        </div> */}
                        <div className="text-[11px] font-mono text-primary/80 font-semibold mt-0.5">
                          {user.username}
                        </div>
                      </td>

                      {/* Official Email */}
                      <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                          <span className="truncate">{user.email || "—"}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>



                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusChip(
                            user.status
                          )}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {user.status}
                        </span>
                      </td>



                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onViewUser && onViewUser(user)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            title="View Profile"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditUser && onEditUser(user)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            title="Edit User"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onResetPassword && onResetPassword(user)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                            title="Reset Password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onToggleStatus &&
                              onToggleStatus(
                                user.id,
                                user.status === "Active" ? "Inactive" : "Active"
                              )
                            }
                            className={`p-1.5 rounded-lg hover:bg-muted ${
                              user.status === "Active"
                                ? "text-amber-500 hover:text-amber-600"
                                : "text-emerald-500 hover:text-emerald-600"
                            }`}
                            title={
                              user.status === "Active"
                                ? "Deactivate User"
                                : "Activate User"
                            }
                          >
                            {user.status === "Active" ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteUser && onDeleteUser(user)}
                            className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paginatedUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground">
                      <div className="max-w-sm mx-auto space-y-3">
                        <ShieldAlert className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                        <h4 className="font-bold text-foreground">No users found</h4>
                        <p className="text-xs text-muted-foreground">
                          No user records match your search or selected filter options.
                        </p>
                        {hasActiveFilters && (
                          <Button size="sm" variant="outline" onClick={clearAllFilters}>
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Mobile Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl bg-card border border-border p-5 shadow-card hover:shadow-elegant transition-smooth space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-primary/20 shrink-0"
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => onViewUser && onViewUser(user)}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors text-left"
                    >
                      {user.fullName}
                    </button>
                    <div className="text-xs font-mono text-primary font-semibold">
                      @{user.username}
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusChip(
                    user.status
                  )}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {user.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">
                    Role
                  </div>
                  <div className="font-semibold text-foreground">{user.role}</div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-border">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onViewUser && onViewUser(user)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditUser && onEditUser(user)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onResetPassword && onResetPassword(user)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteUser && onDeleteUser(user)}
                    className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {paginatedUsers.length === 0 && (
            <div className="col-span-full p-12 text-center text-muted-foreground bg-card rounded-2xl border border-border">
              No users found matching current filters.
            </div>
          )}
        </div>
      )}

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm text-xs">
        <div className="text-muted-foreground">
          Showing{" "}
          <strong className="text-foreground">
            {filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </strong>{" "}
          to{" "}
          <strong className="text-foreground">
            {Math.min(currentPage * pageSize, filteredUsers.length)}
          </strong>{" "}
          of <strong className="text-foreground">{filteredUsers.length}</strong> total records
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 px-2 rounded-lg bg-muted border border-border text-xs font-semibold outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <div className="px-3 py-1 font-bold text-foreground">
              {currentPage} / {totalPages}
            </div>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
}
