export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {/* {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>} */}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, gradient = "primary", trend }) {
  const grad = {
    primary: "bg-gradient-primary",
    success: "bg-gradient-success",
    warning: "bg-gradient-warning",
    info: "bg-gradient-info",
  }[gradient];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-card p-5 transition-smooth hover:shadow-elegant hover:-translate-y-0.5">
      <div className={`absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-20 blur-2xl ${grad}`} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl md:text-3xl font-bold text-foreground">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div className={`h-11 w-11 rounded-xl ${grad} flex items-center justify-center text-primary-foreground shadow-glow`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={`mt-4 inline-flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-success" : "text-destructive"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}

export function Card({ children, className = "", padded = true, ...props }) {
  return (
    <div className={`rounded-2xl bg-card border border-border shadow-card ${padded ? "p-5" : ""} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, action, className = "" }) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {action}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    Active: "bg-success/15 text-success border-success/30",
    Present: "bg-success/15 text-success border-success/30",
    Paid: "bg-success/15 text-success border-success/30",
    Completed: "bg-success/15 text-success border-success/30",
    Received: "bg-info/15 text-info border-info/30",
    Delivered: "bg-info/15 text-info border-info/30",
    Dispatched: "bg-info/15 text-info border-info/30",
    Ordered: "bg-info/15 text-info border-info/30",
    "On Credit": "bg-warning/15 text-warning-foreground border-warning/40",
    Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
    Working: "bg-info/15 text-info border-info/30",
    Late: "bg-warning/15 text-warning-foreground border-warning/40",
    Pending: "bg-warning/15 text-warning-foreground border-warning/40",
    Partial: "bg-warning/15 text-warning-foreground border-warning/40",
    Inactive: "bg-muted text-muted-foreground border-border",
    Absent: "bg-destructive/15 text-destructive border-destructive/30",
    Available: "bg-success/15 text-success border-success/30",
    "In Production": "bg-success/15 text-success border-success/30",
    Running: "bg-success/15 text-success border-success/30",
    "In Sizing": "bg-warning/15 text-warning-foreground border-warning/40",
    "Sent to Sizing": "bg-info/15 text-info border-info/30",
    "Partially Sent": "bg-warning/15 text-warning-foreground border-warning/40",
    "Partially Sent to Sizing": "bg-warning/15 text-warning-foreground border-warning/40",
    "Fully Sent to Sizing": "bg-info/15 text-info border-info/30",
    "Partially Received": "bg-warning/15 text-warning-foreground border-warning/40",
    "Fully Received": "bg-success/15 text-success border-success/30",
    "Ready for Loom": "bg-info/15 text-info border-info/30",
    "Assigned to Loom": "bg-primary/15 text-primary border-primary/30",
    "Assigned": "bg-primary/15 text-primary border-primary/30",
    "Removed from Loom": "bg-muted text-muted-foreground border-border",
    Idle: "bg-muted text-muted-foreground border-border",
    "Under Maintenance": "bg-destructive/15 text-destructive border-destructive/30",
    Maintenance: "bg-destructive/15 text-destructive border-destructive/30",
    Stopped: "bg-destructive/15 text-destructive border-destructive/30",
    Created: "bg-info/15 text-info border-info/30",
    Damaged: "bg-destructive/15 text-destructive border-destructive/30",
    Breakdown: "bg-destructive/15 text-destructive border-destructive/30",
    Production: "bg-success/15 text-success border-success/30",
    Loaded: "bg-info/15 text-info border-info/30",
    Sizing: "bg-warning/15 text-warning-foreground border-warning/40",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${map[status] || "bg-muted text-muted-foreground border-border"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const variants = {
    primary: "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90",
    outline: "border border-border bg-card hover:bg-muted text-foreground",
    ghost: "hover:bg-muted text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-11 px-5 text-sm" };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-smooth ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function fmt(n) {
  return new Intl.NumberFormat("en-PK").format(n);
}
export function pkr(n) {
  return "Rs " + fmt(n);
}
