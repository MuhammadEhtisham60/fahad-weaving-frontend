import React, { useState } from "react";
import {
  Factory,
  Disc,
  Play,
  Square,
  ArrowRight,
  GitFork,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
} from "lucide-react";
import { Card, SectionTitle, StatusBadge, Button, StatCard, fmt } from "../../../../../components/ui-kit.jsx";

export function BeamLoomAssignmentView({
  looms = [],
  beams = [],
  assignmentLogs = [],
  onMount,
  onDismount,
  onTrace,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterShed, setFilterShed] = useState("All");

  const runningLooms = looms.filter((l) => l.status === "Running");
  const idleLooms = looms.filter((l) => l.status === "Idle" || !l.currentBeamId);
  const availableBeams = beams.filter((b) => b.status === "Available" || b.status === "Ready for Loom" || b.status === "Created");

  const filteredLooms = looms.filter((l) => {
    const matchesSearch =
      l.loomNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.currentBeamNo && l.currentBeamNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesShed = filterShed === "All" || l.department.includes(filterShed);
    return matchesSearch && matchesShed;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Running Weaving Looms"
          value={`${runningLooms.length} Looms`}
          hint={`of ${looms.length} total machines`}
          icon={Factory}
          gradient="success"
        />
        <StatCard
          label="Available Beams (Store)"
          value={`${availableBeams.length} Beams`}
          hint="Ready for immediate mounting"
          icon={Disc}
          gradient="primary"
        />
        <StatCard
          label="Idle / Unassigned Looms"
          value={`${idleLooms.length} Looms`}
          hint="Awaiting warp beam mounting"
          icon={Clock}
          gradient="warning"
        />
        <StatCard
          label="Mounted Beams on Floor"
          value={`${looms.filter((l) => l.currentBeamId).length} Active`}
          hint="Live in fabric production"
          icon={Activity}
          gradient="info"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <SectionTitle title="Available Warp Beams" className="mb-0" />
              <p className="text-xs text-muted-foreground mt-0.5">
                Beams in store ready to mount on looms ({availableBeams.length})
              </p>
            </div>
            <Button size="sm" onClick={() => onMount(null, null)}>
              <Play className="h-3.5 w-3.5" /> Quick Assign
            </Button>
          </div>

          <div className="space-y-3 mt-4 max-h-[600px] overflow-y-auto scrollbar-custom pr-1">
            {availableBeams.map((beam) => (
              <div
                key={beam.id}
                className="p-3.5 rounded-xl border border-border bg-muted/20 hover:bg-muted/50 transition-smooth"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-foreground">{beam.beamNo}</span>
                    <span className="text-xs text-muted-foreground font-mono">({beam.beamCode})</span>
                  </div>
                  <StatusBadge status={beam.status} />
                </div>

                <div className="text-xs font-semibold text-foreground">{beam.yarnName}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {beam.ends} Ends · {beam.width} · {fmt(beam.length)}m Warp ({beam.weight} kg)
                </div>

                <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onTrace(beam, "beam")}
                    className="text-[11px] text-purple-500 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <GitFork className="h-3 w-3" /> Trace Lineage
                  </button>
                  <Button size="sm" onClick={() => onMount(null, beam)}>
                    <Play className="h-3 w-3" /> Mount on Loom
                  </Button>
                </div>
              </div>
            ))}

            {availableBeams.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-xs p-4 bg-muted/10 rounded-xl border border-dashed border-border">
                All sized beams are currently mounted on looms or completed. Dispatch new yarn to sizing to produce beams.
              </div>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <SectionTitle title="Weaving Floor — Looms & Mounted Beams" className="mb-0" />
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time shed floor map with currently installed warp beams
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search loom or beam..."
                className="h-8 px-2.5 text-xs rounded-lg bg-muted border border-border outline-none w-36"
              />
              <select
                value={filterShed}
                onChange={(e) => setFilterShed(e.target.value)}
                className="h-8 px-2 text-xs rounded-lg bg-muted border border-border outline-none"
              >
                <option value="All">All Sheds</option>
                <option value="Shed 1">Shed 1 (Rapier)</option>
                <option value="Shed 2">Shed 2 (Air Jet)</option>
                <option value="Shed 3">Shed 3 (Sulzer)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {filteredLooms.map((loom) => {
              const activeBeam = beams.find((b) => b.id === loom.currentBeamId);
              const isMounted = Boolean(loom.currentBeamId || loom.currentBeamNo);
              const isRunning = loom.status === "Running";

              return (
                <div
                  key={loom.id}
                  className={`p-4 rounded-xl border transition-smooth ${
                    isRunning ? "bg-card border-emerald-500/40 shadow-sm" : "bg-muted/20 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-foreground">{loom.loomNo}</span>
                      <span className="text-xs text-muted-foreground">({loom.type})</span>
                    </div>
                    <StatusBadge status={loom.status} />
                  </div>

                  <div className="text-xs font-semibold text-foreground">{loom.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {loom.location} · {loom.rpm} RPM · {loom.operator || "Operator"}
                  </div>

                  <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border text-xs">
                    {isMounted && activeBeam ? (
                      <div>
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground mb-1">
                          <span>Installed Warp Beam</span>
                          <span className="text-emerald-500 font-mono">Running</span>
                        </div>
                        <div className="font-bold text-primary font-mono text-sm">{activeBeam.beamNo}</div>
                        <div className="text-foreground font-medium truncate">{activeBeam.yarnName}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Warp: {fmt(activeBeam.length)}m ({activeBeam.ends} Ends) · Sizing: {activeBeam.sizingNo}
                        </div>
                        <div className="text-[11px] text-emerald-500 font-semibold mt-1">
                          Woven: {fmt(activeBeam.producedMeters || 0)} meters
                        </div>
                      </div>
                    ) : (
                      <div className="py-2 text-center text-muted-foreground italic flex flex-col items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>No warp beam installed on this loom</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onTrace(loom, "loom")}
                      className="text-xs text-purple-500 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <GitFork className="h-3.5 w-3.5" /> Full Trace
                    </button>

                    {isMounted ? (
                      <Button size="sm" variant="danger" onClick={() => onDismount(loom, activeBeam)}>
                        <Square className="h-3 w-3" /> Dismount Beam
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => onMount(loom, null)}>
                        <Play className="h-3 w-3" /> Mount Beam
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle title="Live Beam Assignment & Floor Movement Audit Trail" />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5">Date & Time</th>
                <th className="text-left px-4 py-2.5">Beam Number</th>
                <th className="text-left px-4 py-2.5">Loom</th>
                <th className="text-left px-4 py-2.5">Action Executed</th>
                <th className="text-left px-4 py-2.5">Operator</th>
                <th className="text-left px-4 py-2.5">Remarks / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assignmentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{log.date}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-primary">{log.beamNo}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-foreground">{log.loomNo}</td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">{log.action}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{log.operator}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{log.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
