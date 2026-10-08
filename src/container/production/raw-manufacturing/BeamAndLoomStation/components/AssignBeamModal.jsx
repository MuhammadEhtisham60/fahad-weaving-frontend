import React, { useState } from "react";
import { X, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "../../../../../components/ui-kit.jsx";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../../common/sharefield";

export function AssignBeamModal({
  preselectedLoom,
  preselectedBeam,
  looms = [],
  beams = [],
  onAssign,
  onDismount,
  onClose,
}) {
  const isDismountMode = Boolean(preselectedLoom?.currentBeamId || (preselectedBeam && preselectedBeam.currentLoomId));

  const [mode, setMode] = useState(isDismountMode ? "dismount" : "mount");
  const [selectedLoomId, setSelectedLoomId] = useState(preselectedLoom?.id || "");
  const [selectedBeamId, setSelectedBeamId] = useState(preselectedBeam?.id || "");
  const [assignDate, setAssignDate] = useState(new Date().toISOString().slice(0, 10));
  const [operator, setOperator] = useState("Ahmad Khan (Supervisor)");
  const [producedMeters, setProducedMeters] = useState(2500);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const availableBeams = beams.filter((b) => b.status === "Available" || b.status === "Ready for Loom" || b.status === "Created" || b.id === selectedBeamId);

  const currentLoomObj = looms.find((l) => l.id === selectedLoomId);
  const currentBeamObj = beams.find((b) => b.id === selectedBeamId);

  const loomOptions = [
    { value: "", label: "-- Choose Loom --" },
    ...looms.map((l) => ({
      value: l.id,
      label: `${l.loomNo} · ${l.name} (${l.status}) ${l.currentBeamNo ? `[Has ${l.currentBeamNo}]` : "[Idle]"}`,
    })),
  ];

  const beamOptions = [
    { value: "", label: "-- Choose Available Beam --" },
    ...availableBeams.map((b) => ({
      value: b.id,
      label: `${b.beamNo} · ${b.yarnName} (${b.ends} Ends, ${b.length}m) [${b.status}]`,
    })),
  ];

  const handleMountSubmit = (e) => {
    e.preventDefault();
    if (!selectedLoomId) {
      setError("Please select a target Loom.");
      return;
    }
    if (!selectedBeamId) {
      setError("Please select an available Beam to mount.");
      return;
    }
    if (currentLoomObj && currentLoomObj.currentBeamId && currentLoomObj.currentBeamId !== selectedBeamId) {
      setError(`Loom ${currentLoomObj.loomNo} already has active beam ${currentLoomObj.currentBeamNo}. Please dismount it first.`);
      return;
    }

    onAssign({
      loomId: selectedLoomId,
      beamId: selectedBeamId,
      date: assignDate,
      operator,
      remarks: remarks || `Mounted on ${currentLoomObj?.loomNo || "Loom"} by ${operator}.`,
    });
  };

  const handleDismountSubmit = (e) => {
    e.preventDefault();
    const targetLoom = preselectedLoom || looms.find((l) => l.id === selectedLoomId);
    const targetBeam = preselectedBeam || beams.find((b) => b.id === selectedBeamId || b.id === targetLoom?.currentBeamId);

    if (!targetLoom && !targetBeam) {
      setError("Please select a valid Loom or Beam to dismount.");
      return;
    }

    onDismount({
      loomId: targetLoom?.id || targetBeam?.currentLoomId,
      beamId: targetBeam?.id || targetLoom?.currentBeamId,
      date: assignDate,
      producedMeters: Number(producedMeters) || 0,
      operator,
      remarks: remarks || `Dismounted from ${targetLoom?.loomNo || "Loom"}. Final meters recorded.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {mode === "mount" ? "Assign Beam to Loom" : "Dismount / Complete Beam on Loom"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mode === "mount"
                ? "Mount an available sized beam onto a weaving loom to begin fabric production"
                : "Record fabric woven meters and free up the loom for next warp change"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Toggle if preselected object allows */}
        {preselectedLoom?.currentBeamId && (
          <div className="flex p-1 bg-muted rounded-xl mb-4 border border-border">
            <button
              type="button"
              onClick={() => { setMode("dismount"); setError(""); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-smooth ${
                mode === "dismount" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dismount Active Beam ({preselectedLoom.currentBeamNo})
            </button>
            <button
              type="button"
              onClick={() => { setMode("mount"); setError(""); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-smooth ${
                mode === "mount" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mount New Beam
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === "mount" ? (
          <form onSubmit={handleMountSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Select Loom"
                name="selectedLoomId"
                value={selectedLoomId}
                onChange={(e) => { setSelectedLoomId(e.target.value); setError(""); }}
                options={loomOptions}
                required
                searchable={false}
              />

              <SelectField
                label="Select Available Beam"
                name="selectedBeamId"
                value={selectedBeamId}
                onChange={(e) => { setSelectedBeamId(e.target.value); setError(""); }}
                options={beamOptions}
                required
                searchable={false}
              />
            </div>

            {currentLoomObj && currentBeamObj && (
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                <div className="font-semibold text-primary mb-1">Assignment Preview:</div>
                <div className="flex items-center gap-2 text-foreground">
                  <span>Beam: <strong>{currentBeamObj.beamNo}</strong> ({currentBeamObj.yarnName})</span>
                  <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  <span>Target Loom: <strong>{currentLoomObj.loomNo}</strong> ({currentLoomObj.type})</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Installation Date"
                name="assignDate"
                type="date"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                required
              />

              <InputField
                label="Supervisor / Operator"
                name="operator"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="e.g. Ahmad Khan"
                required
              />
            </div>

            <TextareaField
              label="Remarks / Loom Setup Notes"
              name="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="e.g. Knotting verified, warp tension checked, running at 550 RPM"
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Confirm & Mount Beam
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleDismountSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="font-bold text-amber-500 mb-1">Dismount Active Beam</div>
              <div className="text-foreground">
                You are about to unload Beam <strong>{preselectedLoom?.currentBeamNo || preselectedBeam?.beamNo}</strong> from Loom <strong>{preselectedLoom?.loomNo || preselectedBeam?.currentLoomNo}</strong>.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Dismount Date"
                name="assignDate"
                type="date"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                required
              />

              <InputField
                label="Total Fabric Produced (Meters)"
                name="producedMeters"
                type="number"
                min="0"
                suffix="m"
                value={producedMeters}
                onChange={(e) => setProducedMeters(e.target.value)}
                required
                inputClassName="font-mono font-semibold"
              />
            </div>

            <InputField
              label="Operator / Floor Supervisor"
              name="operator"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              required
            />

            <TextareaField
              label="Final Remarks"
              name="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="e.g. Beam cylinder unloaded. Cloth roll delivered to grey fabric store."
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="danger">
                Dismount & Complete Beam
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

