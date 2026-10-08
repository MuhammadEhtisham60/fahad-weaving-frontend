import React, { useState, useMemo } from "react";
import { X, AlertCircle, Loader2, Play, Factory } from "lucide-react";
import { toast } from "sonner";
import {
  useGetAvailableBeamsQuery,
  useGetLoomsQuery,
  useGetSizingOutcomesQuery,
  useCreateBeamLoadingMutation,
} from "../../../../../../store/index.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../../../common/sharefield";

export function BeamLoadingModal({ preselectedLoom, preselectedBeam, preselectedOutcome, onClose, onSuccess }) {
  const { data: availableBeams = [], isLoading: loadingBeams } = useGetAvailableBeamsQuery();
  const { data: loomsData, isLoading: loadingLooms } = useGetLoomsQuery({ page_size: 100 });
  const { data: outcomesData, isLoading: loadingOutcomes } = useGetSizingOutcomesQuery({ page_size: 100 });

  const looms = loomsData?.results || [];
  const sizingOutcomes = outcomesData?.results || [];

  const [createBeamLoading, { isLoading: isSubmitting }] = useCreateBeamLoadingMutation();

  const [formData, setFormData] = useState({
    sizingOutcome: preselectedOutcome?.id || "",
    beam: preselectedBeam?.id || "",
    loom: preselectedLoom?.id || "",
    warpCount: preselectedOutcome?.count || preselectedBeam?.yarnCount || "40/1",
    weftCount: "40/1",
    reedWidth: preselectedOutcome?.width ? String(preselectedOutcome.width) : "63.00",
    pick: "68.00",
    reedCount: "72.00",
    pickCount: "68.00",
    shortage: preselectedOutcome?.totalSetShortage ? String(preselectedOutcome.totalSetShortage) : "2.50",
    width: preselectedOutcome?.width ? String(preselectedOutcome.width) : "63.00",
    lakhai: "450.00",
    installationDate: new Date().toISOString().slice(0, 10),
  });

  const [formErrors, setFormErrors] = useState({});

  const handleOutcomeChange = (e) => {
    const selectedId = e.target.value;
    const found = sizingOutcomes.find((o) => String(o.id) === String(selectedId));
    setFormData((prev) => ({
      ...prev,
      sizingOutcome: selectedId,
      warpCount: found?.count || prev.warpCount,
      reedWidth: found?.width ? String(found.width) : prev.reedWidth,
      width: found?.width ? String(found.width) : prev.width,
      shortage: found?.totalSetShortage ? String(found.totalSetShortage) : prev.shortage,
    }));
    if (formErrors.sizing_outcome || formErrors.sizingOutcome) {
      setFormErrors((prev) => ({ ...prev, sizing_outcome: null, sizingOutcome: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!formData.sizingOutcome) errors.sizing_outcome = ["Sizing Outcome set is required."];
    if (!formData.beam) errors.beam = ["Please select an Available Beam."];
    if (!formData.loom) errors.loom = ["Please select a target Loom."];

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        sizing_outcome: Number(formData.sizingOutcome),
        beam: Number(formData.beam),
        loom: Number(formData.loom),
        warp_count: formData.warpCount.trim() || undefined,
        weft_count: formData.weftCount.trim() || undefined,
        reed_width: formData.reedWidth ? String(formData.reedWidth) : undefined,
        pick: formData.pick ? String(formData.pick) : undefined,
        reed_count: formData.reedCount ? String(formData.reedCount) : undefined,
        pick_count: formData.pickCount ? String(formData.pickCount) : undefined,
        shortage: formData.shortage ? String(formData.shortage) : undefined,
        width: formData.width ? String(formData.width) : undefined,
        lakhai: formData.lakhai ? String(formData.lakhai) : undefined,
        installation_date: formData.installationDate || undefined,
      };

      await createBeamLoading(payload).unwrap();
      toast.success("Beam loaded successfully onto Loom.");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      if (err?.status === 400 && err?.data) {
        const backendErrs = err.data.errors || err.data;
        if (typeof backendErrs === "object") {
          setFormErrors(backendErrs);
        }
      }
    }
  };

  const beamOptions = useMemo(() => {
    const rawBeams = Array.isArray(availableBeams)
      ? availableBeams
      : Array.isArray(availableBeams?.data)
      ? availableBeams.data
      : Array.isArray(availableBeams?.results)
      ? availableBeams.results
      : [];

    const list = [...rawBeams];
    if (preselectedBeam && !list.some((b) => Number(b.id) === Number(preselectedBeam.id))) {
      list.unshift(preselectedBeam);
    }

    return [
      { value: "", label: "-- Choose Available Beam --" },
      ...list.map((b) => ({
        value: b.id,
        label: `${b.beamCode || b.beamNumber || b.beamNo || `Beam #${b.id}`} · ${b.beamName || "Warp Beam"}${b.yarnCount ? ` (${b.yarnCount})` : ""}`,
      })),
    ];
  }, [availableBeams, preselectedBeam]);

  const loomOptions = useMemo(() => {
    const rawLooms = Array.isArray(loomsData)
      ? loomsData
      : Array.isArray(loomsData?.results)
      ? loomsData.results
      : Array.isArray(loomsData?.data)
      ? loomsData.data
      : [];

    return [
      { value: "", label: "-- Choose Loom --" },
      ...rawLooms.map((l) => ({
        value: l.id,
        label: `${l.loomCode || l.loom_code || l.loomNo || `Loom #${l.id}`} · ${l.loomName || l.loom_name || l.name || "Loom"} (${l.status || "Active"})`,
      })),
    ];
  }, [loomsData]);

  const outcomeOptions = useMemo(() => {
    const rawOutcomes = Array.isArray(outcomesData)
      ? outcomesData
      : Array.isArray(outcomesData?.results)
      ? outcomesData.results
      : Array.isArray(outcomesData?.data)
      ? outcomesData.data
      : [];

    const list = [...rawOutcomes];
    if (preselectedOutcome && !list.some((o) => Number(o.id) === Number(preselectedOutcome.id))) {
      list.unshift(preselectedOutcome);
    }

    return [
      { value: "", label: "-- Choose Sizing Outcome (Set) --" },
      ...list.map((o) => ({
        value: o.id,
        label: `${o.setNo || o.set_no || `Outcome #${o.id}`} · ${o.sizingName || o.sizing_name || "Sizing Mill"} (${o.outcomeDate || o.outcome_date || "Ready"})`,
      })),
    ];
  }, [outcomesData, preselectedOutcome]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Load Beam onto Loom</h2>
              <p className="text-xs text-muted-foreground">
                Mount a sized beam onto a weaving machine with technical weaving parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-custom">
          {Object.keys(formErrors).length > 0 && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="h-4 w-4" /> Please resolve errors:
              </div>
              <ul className="list-disc list-inside">
                {Object.entries(formErrors).map(([key, val]) => (
                  <li key={key}>
                    <strong>{key.replace(/_/g, " ")}:</strong> {Array.isArray(val) ? val.join(", ") : String(val)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form id="beam-loading-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Core Junction Selectors */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border">
              <SelectField
                label="Sizing Outcome (Set)"
                name="sizingOutcome"
                value={formData.sizingOutcome}
                onChange={handleOutcomeChange}
                options={outcomeOptions}
                required
                error={formErrors.sizing_outcome || formErrors.sizingOutcome}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectField
                  label="Available Physical Beam"
                  name="beam"
                  value={formData.beam}
                  onChange={handleChange}
                  options={beamOptions}
                  required
                  error={formErrors.beam}
                />

                <SelectField
                  label="Target Weaving Loom"
                  name="loom"
                  value={formData.loom}
                  onChange={handleChange}
                  options={loomOptions}
                  required
                  error={formErrors.loom}
                />
              </div>
            </div>

            {/* Technical Parameters */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Technical Weaving Specifications
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InputField
                  label="Warp Count"
                  name="warpCount"
                  value={formData.warpCount}
                  onChange={handleChange}
                  placeholder="40/1"
                />

                <InputField
                  label="Weft Count"
                  name="weftCount"
                  value={formData.weftCount}
                  onChange={handleChange}
                  placeholder="40/1"
                />

                <InputField
                  label="Reed Width"
                  name="reedWidth"
                  type="number"
                  step="0.01"
                  value={formData.reedWidth}
                  onChange={handleChange}
                  placeholder="63.00"
                />

                <InputField
                  label="Pick / PPI"
                  name="pick"
                  type="number"
                  step="0.01"
                  value={formData.pick}
                  onChange={handleChange}
                  placeholder="68.00"
                />

                <InputField
                  label="Reed Count"
                  name="reedCount"
                  type="number"
                  step="0.01"
                  value={formData.reedCount}
                  onChange={handleChange}
                  placeholder="72.00"
                />

                <InputField
                  label="Pick Count"
                  name="pickCount"
                  type="number"
                  step="0.01"
                  value={formData.pickCount}
                  onChange={handleChange}
                  placeholder="68.00"
                />

                <InputField
                  label="Shortage (%)"
                  name="shortage"
                  type="number"
                  step="0.01"
                  value={formData.shortage}
                  onChange={handleChange}
                  placeholder="2.50"
                />

                <InputField
                  label="Fabric Width (in)"
                  name="width"
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={handleChange}
                  placeholder="63.00"
                />

                <InputField
                  label="Lakhai / Drawing Cost"
                  name="lakhai"
                  type="number"
                  step="0.01"
                  value={formData.lakhai}
                  onChange={handleChange}
                  placeholder="450.00"
                />

                <InputField
                  label="Installation Date"
                  name="installationDate"
                  type="date"
                  value={formData.installationDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-lg border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="beam-loading-form"
            disabled={isSubmitting}
            className="h-10 px-5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirm & Mount Beam
          </button>
        </div>
      </div>
    </div>
  );
}
