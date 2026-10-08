import React, { useState, useEffect } from "react";
import { X, Layers, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetBeamChoicesQuery,
  useGetBeamByIdQuery,
  useCreateBeamMutation,
  useUpdateBeamMutation,
} from "../../../../store/index.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../common/sharefield";

export function BeamModal({ beamId, onClose }) {
  const isEdit = Boolean(beamId);

  // Queries & Mutations
  const { data: choicesData } = useGetBeamChoicesQuery();
  const { data: beamDetail, isLoading: detailLoading } = useGetBeamByIdQuery(beamId, {
    skip: !isEdit,
  });
  const [createBeam, { isLoading: isCreating }] = useCreateBeamMutation();
  const [updateBeam, { isLoading: isUpdating }] = useUpdateBeamMutation();

  const isSaving = isCreating || isUpdating;

  // Form State
  const [formData, setFormData] = useState({
    beamNumber: "",
    beamCode: "",
    beamName: "",
    length: "",
    weight: "",
    status: "Available",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && beamDetail) {
      setFormData({
        beamNumber: beamDetail.beamNumber || "",
        beamCode: beamDetail.beamCode || "",
        beamName: beamDetail.beamName || "",
        length: beamDetail.length != null ? String(beamDetail.length) : "",
        weight: beamDetail.weight != null ? String(beamDetail.weight) : "",
        status: beamDetail.status || "Available",
        notes: beamDetail.notes || "",
      });
    }
  }, [isEdit, beamDetail]);

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

    // Client-side quick check
    const errors = {};
    if (!formData.beamNumber.trim()) errors.beamNumber = ["Beam number is required."];

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        beamNumber: formData.beamNumber.trim(),
        beamCode: formData.beamCode.trim() || undefined,
        beamName: formData.beamName.trim() || undefined,
        length: formData.length ? parseFloat(formData.length) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        status: formData.status || "Available",
        notes: formData.notes.trim() || undefined,
      };

      if (isEdit) {
        await updateBeam({ id: beamId, ...payload }).unwrap();
        toast.success("Beam updated successfully.");
      } else {
        await createBeam(payload).unwrap();
        toast.success("Beam created successfully.");
      }
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

  const statusChoices = choicesData?.statusChoices || [
    { value: "Available", label: "Available" },
    { value: "Sizing", label: "Sizing" },
    { value: "Loaded", label: "Loaded" },
    { value: "In Production", label: "In Production" },
    { value: "Completed", label: "Completed" },
    { value: "Damaged", label: "Damaged" },
    { value: "Inactive", label: "Inactive" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEdit ? "Edit Beam" : "Add New Beam"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? "Update beam specifications and details"
                  : "Register a newly prepared beam into factory inventory"}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-custom">
          {detailLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <span className="text-xs font-semibold">Loading beam information...</span>
            </div>
          ) : (
            <form id="beam-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Validation Summary Error Banner */}
              {Object.keys(formErrors).length > 0 && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertCircle className="h-4 w-4" /> Please resolve the following errors:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5">
                    {Object.entries(formErrors).map(([key, val]) => (
                      <li key={key}>
                        <strong className="capitalize">{key.replace(/([A-Z])/g, " $1")}:</strong>{" "}
                        {Array.isArray(val) ? val.join(", ") : String(val)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Identification Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Beam Identification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Beam Number */}
                  <InputField
                    label="Beam Number"
                    name="beamNumber"
                    value={formData.beamNumber}
                    onChange={handleChange}
                    placeholder="e.g. BN-10001"
                    required
                    error={Array.isArray(formErrors.beamNumber) ? formErrors.beamNumber[0] : formErrors.beamNumber}
                    inputClassName="font-mono"
                  />

                  {/* Beam Code */}
                  <InputField
                    label="Beam Code"
                    name="beamCode"
                    value={formData.beamCode}
                    onChange={handleChange}
                    placeholder="e.g. BC-C40-2500"
                    error={Array.isArray(formErrors.beamCode) ? formErrors.beamCode[0] : formErrors.beamCode}
                    inputClassName="font-mono"
                  />

                  {/* Beam Name */}
                  <InputField
                    label="Beam Name / Description"
                    name="beamName"
                    value={formData.beamName}
                    onChange={handleChange}
                    placeholder="e.g. Main Sizing Beam 1"
                    error={Array.isArray(formErrors.beamName) ? formErrors.beamName[0] : formErrors.beamName}
                  />
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Technical Specifications
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Length (m) */}
                  <InputField
                    label="Length (meters)"
                    type="number"
                    step="0.01"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    placeholder="e.g. 1500.00"
                    error={Array.isArray(formErrors.length) ? formErrors.length[0] : formErrors.length}
                  />

                  {/* Weight (kg) */}
                  <InputField
                    label="Weight (kg)"
                    type="number"
                    step="0.01"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 250.00"
                    error={Array.isArray(formErrors.weight) ? formErrors.weight[0] : formErrors.weight}
                  />

                  {/* Status */}
                  <SelectField
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={statusChoices}
                    error={Array.isArray(formErrors.status) ? formErrors.status[0] : formErrors.status}
                  />
                </div>

                {/* Notes */}
                <TextareaField
                  label="Notes / Remarks"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter any production notes, handling instructions, or sizing remarks..."
                  error={Array.isArray(formErrors.notes) ? formErrors.notes[0] : formErrors.notes}
                />
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-muted/30">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-10 px-4 rounded-lg border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="beam-form"
            disabled={isSaving || detailLoading}
            className="h-10 px-5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Update Beam" : "Save Beam"}
          </button>
        </div>
      </div>
    </div>
  );
}

