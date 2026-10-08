import React, { useState, useEffect } from "react";
import { X, Cpu, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetLoomChoicesQuery,
  useGetLoomByIdQuery,
  useCreateLoomMutation,
  useUpdateLoomMutation,
} from "../../../../store/index.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../common/sharefield";

export function LoomModal({ loomId, onClose }) {
  const isEdit = Boolean(loomId);

  // Queries & Mutations
  const { data: choicesData } = useGetLoomChoicesQuery();
  const { data: loomDetail, isLoading: detailLoading } = useGetLoomByIdQuery(loomId, {
    skip: !isEdit,
  });
  const [createLoom, { isLoading: isCreating }] = useCreateLoomMutation();
  const [updateLoom, { isLoading: isUpdating }] = useUpdateLoomMutation();

  const isSaving = isCreating || isUpdating;

  // Form State
  const [formData, setFormData] = useState({
    loomCode: "",
    loomName: "",
    modelNumber: "",
    width: "",
    installationDate: "",
    location: "",
    status: "Active",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && loomDetail) {
      setFormData({
        loomCode: loomDetail.loomCode || "",
        loomName: loomDetail.loomName || "",
        modelNumber: loomDetail.modelNumber || "",
        width: loomDetail.width != null ? String(loomDetail.width) : "",
        installationDate: loomDetail.installationDate || "",
        location: loomDetail.location || "",
        status: loomDetail.status || "Active",
        notes: loomDetail.notes || "",
      });
    }
  }, [isEdit, loomDetail]);

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

    // Client-side quick validation
    const errors = {};
    if (!formData.loomCode.trim()) errors.loomCode = ["Loom code is required."];
    if (!formData.loomName.trim()) errors.loomName = ["Loom name is required."];

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        loomCode: formData.loomCode.trim(),
        loomName: formData.loomName.trim(),
        modelNumber: formData.modelNumber.trim() || undefined,
        width: formData.width !== "" && formData.width != null ? parseFloat(formData.width) : undefined,
        installationDate: formData.installationDate || undefined,
        location: formData.location.trim() || undefined,
        status: formData.status || "Active",
        notes: formData.notes.trim() || undefined,
      };

      if (isEdit) {
        await updateLoom({ id: loomId, ...payload }).unwrap();
        toast.success("Loom updated successfully.");
      } else {
        await createLoom(payload).unwrap();
        toast.success("Loom created successfully.");
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
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Sizing", label: "Sizing" },
    { value: "Production", label: "Production" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Breakdown", label: "Breakdown" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isEdit ? "Edit Loom" : "Add New Loom"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit
                  ? "Update weaving machine details and location"
                  : "Register a new loom unit into factory equipment records"}
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
              <span className="text-xs font-semibold">Loading loom information...</span>
            </div>
          ) : (
            <form id="loom-form" onSubmit={handleSubmit} className="space-y-6">
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
                  Loom Identification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Loom Code */}
                  <InputField
                    label="Loom Code"
                    name="loomCode"
                    value={formData.loomCode}
                    onChange={handleChange}
                    placeholder="e.g. L-001"
                    required
                    error={Array.isArray(formErrors.loomCode) ? formErrors.loomCode[0] : formErrors.loomCode}
                    inputClassName="font-mono uppercase"
                  />

                  {/* Loom Name */}
                  <InputField
                    label="Loom Name"
                    name="loomName"
                    value={formData.loomName}
                    onChange={handleChange}
                    placeholder="e.g. Loom A1"
                    required
                    error={Array.isArray(formErrors.loomName) ? formErrors.loomName[0] : formErrors.loomName}
                  />
                </div>
              </div>

              {/* Machinery Specifications & Status */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Specifications & Location
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Model Number */}
                  <InputField
                    label="Model Number"
                    name="modelNumber"
                    value={formData.modelNumber}
                    onChange={handleChange}
                    placeholder="e.g. TM-500"
                    error={Array.isArray(formErrors.modelNumber) ? formErrors.modelNumber[0] : formErrors.modelNumber}
                  />

                  {/* Width (cm) */}
                  <InputField
                    label="Width (cm)"
                    type="number"
                    step="0.01"
                    name="width"
                    value={formData.width}
                    onChange={handleChange}
                    placeholder="e.g. 220.00"
                    error={Array.isArray(formErrors.width) ? formErrors.width[0] : formErrors.width}
                  />

                  {/* Installation Date */}
                  <InputField
                    label="Installation Date"
                    type="date"
                    name="installationDate"
                    value={formData.installationDate}
                    onChange={handleChange}
                    error={Array.isArray(formErrors.installationDate) ? formErrors.installationDate[0] : formErrors.installationDate}
                  />

                  {/* Location */}
                  <InputField
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Hall A, Section 3"
                    error={Array.isArray(formErrors.location) ? formErrors.location[0] : formErrors.location}
                  />

                  {/* Status */}
                  <div className="sm:col-span-2">
                    <SelectField
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      options={statusChoices}
                      error={Array.isArray(formErrors.status) ? formErrors.status[0] : formErrors.status}
                    />
                  </div>
                </div>

                {/* Notes */}
                <TextareaField
                  label="Notes / Remarks"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter machine maintenance remarks, history, or operational notes..."
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
            form="loom-form"
            disabled={isSaving || detailLoading}
            className="h-10 px-5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-sm shadow-glow hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Update Loom" : "Save Loom"}
          </button>
        </div>
      </div>
    </div>
  );
}

