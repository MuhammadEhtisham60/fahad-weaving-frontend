import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Clock, Wallet, Package, ShoppingCart,
  TrendingUp, BarChart3, Settings, Factory, LogOut, Timer, Layers, UserCog, History,
  ChevronDown, ChevronRight, ReceiptText
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout, useLogoutApiMutation } from "../../store/index.js";
import { useTranslation } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export const nav = [
  {
    group: "Overview",
    groupKey: "sidebar.overview",
    items: [
      { to: "/", label: "Dashboard", labelKey: "sidebar.dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
    ],
  },
  {
    group: "Operations",
    groupKey: "sidebar.operations",
    items: [
      {
        label: "Weaving Operations",
        labelKey: "sidebar.weavingOperations",
        icon: Factory,
        children: [
          { to: "/production/raw-manufacturing", label: "Production Flow", labelKey: "sidebar.rawManufacturing", permission: "mfg.view" },
          { to: "/production/beam", label: "Beam", labelKey: "sidebar.beam", permission: "beams.view" },
          { to: "/production/loom", label: "Loom", labelKey: "sidebar.loom", permission: "looms.view" },
          { to: "/production/sizing", label: "Sizing", labelKey: "sidebar.sizing", permission: "sizing.view" },
        ],
      },
      {
        label: "Purchase",
        labelKey: "sidebar.purchase",
        icon: ShoppingCart,
        permission: "po.view",
        children: [
          { to: "/purchase", label: "Purchase Invoice", labelKey: "sidebar.purchaseInvoice", permission: "po.view" },
          { to: "/purchase/supplier", label: "Supplier", labelKey: "sidebar.supplier", permission: "suppliers.view" },
        ],
      },
      {
        label: "Sales",
        labelKey: "sidebar.sales",
        icon: TrendingUp,
        permission: "sale.view",
        children: [
          { to: "/sale", label: "Sales Invoice", labelKey: "sidebar.salesInvoice", permission: "sale.view" },
          { to: "/sale/customer", label: "Customer", labelKey: "sidebar.customer", permission: "customers.view" },
        ],
      },
      { to: "/daily-ledger", label: "Daily Ledger", labelKey: "sidebar.dailyLedger", icon: ReceiptText, permission: "daily_ledger.view" },
      { to: "/inventory", label: "Inventory", labelKey: "sidebar.inventory", icon: Package, permission: "inv.view" },
    ],
  },
  {
    group: "Workforce",
    groupKey: "sidebar.workforce",
    items: [
      { to: "/hr/employees", label: "Employees", labelKey: "sidebar.employees", icon: Users, permission: "emp.view" },
      { to: "/hr/attendance", label: "Attendance Log", labelKey: "sidebar.attendance", icon: Clock, permission: "att.view" },
      { to: "/hr/mark-attendance", label: "Mark Attendance", labelKey: "sidebar.markAttendance", icon: Timer, permission: "att.mark" },
      { to: "/hr/employee-salary", label: "Employee Salary", labelKey: "sidebar.employeeSalary", icon: Wallet, permission: "payroll.process" },
      { to: "/hr/payroll", label: "Payroll", labelKey: "sidebar.payroll", icon: Wallet, permission: "payroll.process" },
    ],
  },
  {
    group: "Administration",
    groupKey: "sidebar.administration",
    items: [
      { to: "/user-management", label: "User Management", labelKey: "sidebar.userManagement", icon: UserCog, permission: "users.view" },
      { to: "/activity-log", label: "Activity Log", labelKey: "sidebar.activityLog", icon: History, permission: "activity.view" },
    ],
  },
  {
    group: "Insights",
    groupKey: "sidebar.insights",
    items: [
      { to: "/reports", label: "Reports", labelKey: "sidebar.reports", icon: BarChart3, permission: "rep.view" },
      { to: "/settings", label: "Settings", labelKey: "sidebar.settings", icon: Settings, permission: "settings.view" },
    ],
  },
];

export function Sidebar({ open, setOpen }) {
  const { t } = useTranslation();
  const { hasPermission, isSuperuser, user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [logoutApi] = useLogoutApiMutation();
  const path = useRouterState({ select: (r) => r.location.pathname });

  const activeUser = user || currentUser;
  const isSuper = Boolean(
    isSuperuser ||
    activeUser?.is_superuser === true ||
    activeUser?.is_superuser === "true" ||
    activeUser?.role === "Super Admin" ||
    activeUser?.role === "superadmin" ||
    activeUser?.role === "Superuser" ||
    activeUser?.role === "superuser" ||
    activeUser?.username === "superadmin" ||
    activeUser?.username === "admin"
  );

  // State to manage open/expanded dropdown menu items
  const [openDropdowns, setOpenDropdowns] = useState(() => {
    const initial = {};
    if (path.startsWith("/purchase")) initial["Purchase"] = true;
    if (path.startsWith("/sale")) initial["Sales"] = true;
    if (path.startsWith("/production")) {
      initial["Production"] = true;
    }
    return initial;
  });

  // Auto-expand parent dropdown if navigating into its submodule route
  useEffect(() => {
    if (path.startsWith("/purchase")) {
      setOpenDropdowns((prev) => ({ ...prev, Purchase: true }));
    } else if (path.startsWith("/sale")) {
      setOpenDropdowns((prev) => ({ ...prev, Sales: true }));
    } else if (path.startsWith("/production")) {
      setOpenDropdowns((prev) => ({ ...prev, Production: true }));
    }
  }, [path]);

  const toggleDropdown = (label) => {
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // If superuser, show all modules and submodules directly; otherwise filter by permissions
  const filteredNav = isSuper
    ? nav
    : nav
        .map((g) => {
          const visibleItems = g.items
            .map((it) => {
              if (it.children) {
                const visibleChildren = it.children.filter((child) => {
                  if (!child.permission) return true;
                  return hasPermission(child.permission);
                });
                if (visibleChildren.length === 0) return null;
                return { ...it, children: visibleChildren };
              }
              if (it.permission && !hasPermission(it.permission)) return null;
              return it;
            })
            .filter(Boolean);
          return { ...g, items: visibleItems };
        })
        .filter((g) => g.items.length > 0);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await logoutApi(refreshToken).unwrap();
      }
    } catch {
      // ignore network errors on logout
    } finally {
      dispatch(logout());
      navigate({ to: "/auth/login" });
    }
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 z-40 h-screen bg-sidebar border-r rtl:border-r-0 rtl:border-l border-sidebar-border flex flex-col transition-all duration-300 ease-in-out shrink-0 ${open
          ? "w-64 translate-x-0"
          : "-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden border-none"
        }`}
    >
      <div className="px-5 pb-3 border-b border-sidebar-border flex items-center justify-between" style={{ paddingTop: "11px" }}>
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <Factory className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sidebar-foreground tracking-tight truncate">{t("sidebar.brandTitle", "Fahad Weaving")}</div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest truncate">{t("sidebar.brandSubtitle", "Factory Management")}</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-custom px-3 py-4 space-y-6">
        {filteredNav.map((g) => (
          <div key={g.group}>
            <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              {t(g.groupKey, g.group)}
            </div>
            <div className="space-y-1">
              {g.items.map((it) => {
                const Icon = it.icon;

                // Handle expandable dropdown item
                if (it.children) {
                  const isOpen = Boolean(openDropdowns[it.label]);
                  const isParentActive = it.children.some((child) => {
                    if (child.to === "/purchase") return path === "/purchase" || path === "/purchase/";
                    if (child.to === "/sale") return path === "/sale" || path === "/sale/";
                    if (child.to === "/production/raw-manufacturing") return path === "/production/raw-manufacturing" || path === "/production/raw-manufacturing/";
                    return path.startsWith(child.to);
                  });

                  return (
                    <div key={it.label} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleDropdown(it.label)}
                        className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                          isParentActive && !isOpen
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{t(it.labelKey, it.label)}</span>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="ml-4 pl-3 border-l-2 border-sidebar-border/60 space-y-1 my-1">
                          {it.children.map((child) => {
                            let childActive = false;
                            if (child.to === "/purchase") {
                              childActive = path === "/purchase" || path === "/purchase/";
                            } else if (child.to === "/sale") {
                              childActive = path === "/sale" || path === "/sale/";
                            } else if (child.to === "/production/raw-manufacturing") {
                              childActive = path === "/production/raw-manufacturing" || path === "/production/raw-manufacturing/";
                            } else {
                              childActive = path.startsWith(child.to);
                            }

                            return (
                              <Link
                                key={child.to}
                                to={child.to}
                                onClick={() => {
                                  if (typeof window !== "undefined" && window.innerWidth <= 1024) {
                                    setOpen(false);
                                  }
                                }}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-smooth ${
                                  childActive
                                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${childActive ? "bg-primary-foreground" : "bg-muted-foreground/50 group-hover:bg-sidebar-accent-foreground"}`} />
                                <span className="truncate">{t(child.labelKey, child.label)}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Handle standard single link item
                const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.innerWidth <= 1024) {
                        setOpen(false);
                      }
                    }}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                      active
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{t(it.labelKey, it.label)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-smooth">
          <div className="h-9 w-9 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold text-xs uppercase shadow-sm shrink-0">
            {currentUser?.fullName ? currentUser.fullName.slice(0, 2) : "AU"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate text-sidebar-foreground">
              {currentUser?.fullName || "Admin User"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {currentUser?.email || currentUser?.role || "admin@fahadweaving.com"}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title={t("sidebar.logout", "Logout")}
            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}
