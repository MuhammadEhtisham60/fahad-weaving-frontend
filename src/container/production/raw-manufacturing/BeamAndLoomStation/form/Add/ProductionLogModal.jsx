import React, { useState } from "react";
import { X, AlertCircle, Loader2, Play, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetActiveBeamLoadingsQuery,
  useCreateProductionMutation,
} from "../../../../../../store/index.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../../../common/sharefield";

export function ProductionLogModal({ preselectedLoading, onClose, onSuccess }) {
  const { data: activeLoadings = [], isLoading: loadingActive } = useGetActiveBeamLoadingsQuery();
  const [createProduction, { isLoading: isSubmitting }] = useCreateProductionMutation();

  const [formData, setFormData] = useState({
    beamLoading: preselectedLoading?.id || "",
    productionDate: new Date().toISOString().slice(0, 10),
    metersProduced: "",
    shift: "Morning",
    operatorName: "",
    remarks: "",
    beamEmptied: false,
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const meters = Number(formData.metersProduced);
    const errors = {};
    if (!formData.beamLoading) errors.beam_loading = ["Please select an active Loom & Beam."];
    if (!meters || meters <= 0) errors.meters_produced = ["Please enter valid meters produced."];

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        beam_loading: Number(formData.beamLoading),
        production_date: formData.productionDate,
        meters_produced: String(formData.metersProduced),
        shift: formData.shift,
        operator_name: formData.operatorName.trim() || undefined,
        remarks: formData.remarks.trim() || undefined,
        beam_emptied: Boolean(formData.beamEmptied),
      };

      await createProduction(payload).unwrap();
      if (formData.beamEmptied) {
        toast.success(`Recorded ${meters}m! Beam is emptied and now Available for reuse.`);
      } else {
        toast.success(`Recorded ${meters} meters of production successfully.`);
      }

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

  const shiftOptions = [
    { value: "Morning", label: "Morning Shift (06:00 - 14:00)" },
    { value: "Evening", label: "Evening Shift (14:00 - 22:00)" },
    { value: "Night", label: "Night Shift (22:00 - 06:00)" },
    { value: "General", label: "General Shift" },
  ];

  const loadingOptions = [
    { value: "", label: "-- Select Active Mounted Loom & Beam --" },
    ...activeLoadings.map((l) => ({
      value: l.id,
      label: `Loom ${l.loomCode || l.loomDetail?.loomCode || l.loom} ── Beam ${l.beamCode || l.beamDetail?.beamCode || l.beam} (${l.setNo || "Active"})`,
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Log Daily Production</h2>
              <p className="text-xs text-muted-foreground">
                Record woven cloth meters produced on an active loom installation
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

          <form id="production-form" onSubmit={handleSubmit} className="space-y-4">
            <SelectField
              label="Active Loom & Beam Installation"
              name="beamLoading"
              value={formData.beamLoading}
              onChange={handleChange}
              options={loadingOptions}
              required
              error={formErrors.beam_loading || formErrors.beamLoading}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Production Date"
                name="productionDate"
                type="date"
                value={formData.productionDate}
                onChange={handleChange}
                required
              />

              <SelectField
                label="Operating Shift"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                options={shiftOptions}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label="Meters Produced"
                name="metersProduced"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.metersProduced}
                onChange={handleChange}
                placeholder="e.g. 620.50"
                required
                error={formErrors.meters_produced || formErrors.metersProduced}
                inputClassName="font-mono font-bold"
              />

              <InputField
                label="Weaver / Loom Master"
                name="operatorName"
                value={formData.operatorName}
                onChange={handleChange}
                placeholder="e.g. Akram Weaver"
              />
            </div>

            {/* Beam Emptied Checkbox Card */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="beamEmptied"
                  checked={formData.beamEmptied}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-foreground">
                    Beam Emptied (Final Cut / Warp Exhausted)
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Check this if the beam has finished weaving. The system will automatically mark the physical Beam as <strong>Available</strong> for future sizing sets and reset the Loom to Active.
                  </div>
                </div>
              </label>
            </div>

            <TextareaField
              label="Production Remarks / Quality Observations"
              name="remarks"
              rows={2}
              value={formData.remarks}
              onChange={handleChange}
              placeholder="e.g. Smooth running, 1 weft stop, zero defects"
            />
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
            form="production-form"
            disabled={isSubmitting}
            className="h-10 px-5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Daily Production
          </button>
        </div>
      </div>
    </div>
  );
}
