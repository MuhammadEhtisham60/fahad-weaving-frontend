import React from "react";
import {
  Package,
  Workflow,
  Disc,
  Factory,
  TrendingUp,
  Activity,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { StatCard, Card, SectionTitle, StatusBadge, Button, fmt } from "../../../../../components/ui-kit.jsx";
import { ManufacturingFlow } from "./ManufacturingFlow.jsx";

export function ManufacturingDashboard({
  stats,
  rawMaterials = [],
  sizingEntries = [],
  beams = [],
  looms = [],
  assignmentLogs = [],
  onSelectTab,
  onOpenNewModal,
  onOpenAssignModal,
  onOpenTraceModal,
}) {
  // Production Trend Mock series
  const productionTrendData = [
    { month: "May", rawBags: 340, sizingBags: 280, beamsMade: 18, wovenM: 28000 },
    { month: "Jun", rawBags: 420, sizingBags: 360, beamsMade: 24, wovenM: 36500 },
    { month: "Jul", rawBags: 390, sizingBags: 310, beamsMade: 20, wovenM: 32000 },
    { month: "Aug", rawBags: 480, sizingBags: 400, beamsMade: 28, wovenM: 42000 },
    { month: "Sep", rawBags: stats.totalRawBags, sizingBags: stats.totalBagsSentToSizing, beamsMade: stats.totalBeams * 2, wovenM: stats.totalFabricWovenMeters },
  ];

  // Beam Status Distribution
  const beamStatusData = [
    { name: "In Production", value: stats.beamsInProduction || 1, color: "oklch(0.65 0.16 155)" },
    { name: "Available / Ready", value: stats.availableBeams || 1, color: "oklch(0.55 0.22 280)" },
    { name: "Completed / Run-Out", value: stats.completedBeams || 1, color: "oklch(0.7 0.03 265)" },
  ];

  // Loom Status by Shed
  const loomShedData = [
    { shed: "Shed 1 (Rapier)", running: looms.filter(l => l.department.includes("Shed 1") && l.status === "Running").length, idle: looms.filter(l => l.department.includes("Shed 1") && l.status !== "Running").length },
    { shed: "Shed 2 (Air Jet)", running: looms.filter(l => l.department.includes("Shed 2") && l.status === "Running").length, idle: looms.filter(l => l.department.includes("Shed 2") && l.status !== "Running").length },
    { shed: "Shed 3 (Sulzer)", running: looms.filter(l => l.department.includes("Shed 3") && l.status === "Running").length, idle: looms.filter(l => l.department.includes("Shed 3") && l.status !== "Running").length },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Pipeline Component */}
      <ManufacturingFlow stats={stats} onSelectTab={onSelectTab} />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Raw Yarn Intake"
          value={`${fmt(stats.totalRawBags)} Bags`}
          hint={`${fmt(stats.totalRawWeight)} kg total received`}
          icon={Package}
          gradient="primary"
          trend={6.8}
        />
        <StatCard
          label="Dispatched to Sizing"
          value={`${fmt(stats.totalBagsSentToSizing)} Bags`}
          hint={`${stats.activeSizingBatches} active sizing runs (${fmt(stats.sizingBagsInProgress)} bags)`}
          icon={Workflow}
          gradient="warning"
          trend={12.4}
        />
        <StatCard
          label="Warp Beams Stock"
          value={`${stats.totalBeams} Beams`}
          hint={`${stats.availableBeams} ready · ${stats.beamsInProduction} on looms`}
          icon={Disc}
          gradient="info"
          trend={3.5}
        />
        <StatCard
          label="Loom Shed Utilization"
          value={`${stats.loomUtilization}%`}
          hint={`${stats.runningLooms} running · ${stats.idleLooms} idle · ${stats.maintenanceLooms} maint`}
          icon={Factory}
          gradient="success"
          trend={stats.runningLooms > 0 ? 5.2 : 0}
        />
      </div>

      {/* Production Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <SectionTitle
            title="Manufacturing Throughput Trend"
            action={<span className="text-xs text-muted-foreground">Raw Intake vs Sizing vs Woven Output</span>}
          />
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={productionTrendData}>
                <defs>
                  <linearGradient id="gRaw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.22 280)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.55 0.22 280)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSizing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 75)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 270)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.03 265)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 265)" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 270)" }}
                  formatter={(v, name) => [
                    name === "wovenM" ? `${fmt(v)} meters` : `${fmt(v)} bags`,
                    name === "rawBags" ? "Raw Yarn Received" : name === "sizingBags" ? "Sent to Sizing" : "Meters Woven",
                  ]}
                />
                <Area type="monotone" dataKey="rawBags" stroke="oklch(0.55 0.22 280)" fill="url(#gRaw)" strokeWidth={2} name="rawBags" />
                <Area type="monotone" dataKey="sizingBags" stroke="oklch(0.78 0.16 75)" fill="url(#gSizing)" strokeWidth={2} name="sizingBags" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Warp Beams Distribution" />
          <div className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={beamStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                  {beamStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-muted-foreground mt-2">
              Total Active Beams in System: <strong>{stats.totalBeams}</strong>
            </div>
          </div>
        </Card>
      </div>

      {/* Loom Shed Efficiency & Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <SectionTitle title="Weaving Shed Loom Status" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={loomShedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.012 270)" />
                <XAxis dataKey="shed" stroke="oklch(0.5 0.03 265)" fontSize={11} />
                <YAxis stroke="oklch(0.5 0.03 265)" fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="running" stackId="a" fill="oklch(0.65 0.16 155)" name="Running Looms" radius={[0, 0, 0, 0]} />
                <Bar dataKey="idle" stackId="a" fill="oklch(0.78 0.16 75)" name="Idle / Maintenance" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
            <span>Running Looms: <strong className="text-emerald-500">{stats.runningLooms}</strong></span>
            <span>Idle / Stopped: <strong className="text-amber-500">{stats.idleLooms + stats.maintenanceLooms}</strong></span>
          </div>
        </Card>

        {/* Live Assignment Station Quick View */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <SectionTitle title="Active Mounted Beams & Live Looms" className="mb-0" />
            <Button size="sm" onClick={() => onSelectTab("assignment")}>
              Open Beam Station <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {looms.slice(0, 6).map((loom) => {
              const activeBeam = beams.find((b) => b.id === loom.currentBeamId);
              const isRunning = loom.status === "Running";
              return (
                <div
                  key={loom.id}
                  className={`p-3.5 rounded-xl border transition-smooth hover:shadow-card cursor-pointer ${
                    isRunning ? "bg-card border-emerald-500/40" : "bg-muted/20 border-border"
                  }`}
                  onClick={() => onOpenAssignModal(loom, activeBeam)}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-sm text-foreground">{loom.loomNo}</span>
                    <StatusBadge status={loom.status} />
                  </div>
                  <div className="text-xs font-medium text-foreground truncate">{loom.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{loom.type}</div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 text-xs">
                    {activeBeam ? (
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground">Active Beam</div>
                        <div className="font-semibold text-primary truncate">{activeBeam.beamNo} ({activeBeam.yarnName})</div>
                        <div className="text-[10px] text-emerald-500 mt-0.5">
                          {fmt(activeBeam.producedMeters || 0)} / {fmt(activeBeam.length)} m woven
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground italic flex items-center gap-1">
                        <Clock className="h-3 w-3" /> No beam mounted (Idle)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Quick Action Station & Movement Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <SectionTitle title="Recent Manufacturing Movement Logs" />
          <div className="space-y-2.5">
            {assignmentLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-smooth">
                <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">
                    Beam <strong>{log.beamNo}</strong> → Loom <strong>{log.loomNo}</strong> ({log.action})
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {log.remarks} · Operator: {log.operator}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono text-muted-foreground">{log.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Manufacturing Shortcuts" />
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onOpenNewModal("raw-material")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted transition-smooth border border-border text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Intake Raw Yarn</div>
                  <div className="text-[10px] text-muted-foreground">Record incoming yarn bags</div>
                </div>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => onOpenNewModal("sizing")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted transition-smooth border border-border text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Workflow className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Send to Sizing</div>
                  <div className="text-[10px] text-muted-foreground">Dispatch yarn lot to sizing mill</div>
                </div>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => onOpenNewModal("beam")}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted transition-smooth border border-border text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Disc className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Receive / Add Beam</div>
                  <div className="text-[10px] text-muted-foreground">Log completed warp beam</div>
                </div>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </button>

            <button
              type="button"
              onClick={() => onOpenAssignModal()}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-smooth border border-primary/20 text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Play className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-primary">Mount Beam on Loom</div>
                  <div className="text-[10px] text-muted-foreground">Assign beam to start weaving</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-primary" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
